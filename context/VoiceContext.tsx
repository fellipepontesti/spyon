import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { socket } from "@spyon/services/socket"
import { useSala } from "@spyon/context/salaContext"

type VoiceContextData = {
  isSupported: boolean
  muted: boolean
  toggleMute: () => void
  activeSpeakers: { [socketId: string]: boolean }
  mutedPlayers: { [socketId: string]: boolean }
  joinedVoice: boolean
  joinVoiceChat: () => void
  leaveVoiceChat: () => void
}

const VoiceContext = createContext<VoiceContextData>({} as VoiceContextData)

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { sala } = useSala()
  const [isSupported, setIsSupported] = useState(false)
  const [muted, setMuted] = useState(false)
  const [joinedVoice, setJoinedVoice] = useState(false)
  const [mutedPlayers, setMutedPlayers] = useState<{ [socketId: string]: boolean }>({})
  const [activeSpeakers, setActiveSpeakers] = useState<{ [socketId: string]: boolean }>({})

  const localStreamRef = useRef<any>(null)
  const peersRef = useRef<{ [socketId: string]: any }>({})
  const audioElementsRef = useRef<{ [socketId: string]: any }>({})

  // Checar se WebRTC é suportado no ambiente atual (Web ou React Native com WebRTC instalado)
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      !!window.RTCPeerConnection &&
      !!window.navigator?.mediaDevices?.getUserMedia
    setIsSupported(supported)
  }, [])

  // Limpeza ao sair ou desmontar
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    // Parar stream local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => track.stop())
      localStreamRef.current = null
    }

    // Fechar todas as conexões peer
    Object.keys(peersRef.current).forEach((socketId) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close()
      }
    })
    peersRef.current = {}

    // Remover elementos de áudio
    Object.keys(audioElementsRef.current).forEach((socketId) => {
      const el = audioElementsRef.current[socketId]
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
    audioElementsRef.current = {}

    setJoinedVoice(false)
    setActiveSpeakers({})
  }

  // Ouvir eventos do socket para sinalização WebRTC
  useEffect(() => {
    if (!joinedVoice) return

    const handleOffer = async ({ senderSocketId, sdp }: { senderSocketId: string; sdp: any }) => {
      try {
        const pc = getOrCreatePeer(senderSocketId)
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket.emit("webrtc-answer", {
          targetSocketId: senderSocketId,
          sdp: answer,
        })
      } catch (err) {
        console.error("Erro ao tratar webrtc-offer:", err)
      }
    }

    const handleAnswer = async ({ senderSocketId, sdp }: { senderSocketId: string; sdp: any }) => {
      try {
        const pc = peersRef.current[senderSocketId]
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        }
      } catch (err) {
        console.error("Erro ao tratar webrtc-answer:", err)
      }
    }

    const handleIceCandidate = async ({
      senderSocketId,
      candidate,
    }: {
      senderSocketId: string
      candidate: any
    }) => {
      try {
        const pc = peersRef.current[senderSocketId]
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        }
      } catch (err) {
        console.error("Erro ao tratar webrtc-ice-candidate:", err)
      }
    }

    const handlePlayerMuteUpdated = ({ socketId, muted }: { socketId: string; muted: boolean }) => {
      setMutedPlayers((prev) => ({ ...prev, [socketId]: muted }))
    }

    socket.on("webrtc-offer", handleOffer)
    socket.on("webrtc-answer", handleAnswer)
    socket.on("webrtc-ice-candidate", handleIceCandidate)
    socket.on("player-mute-updated", handlePlayerMuteUpdated)

    return () => {
      socket.off("webrtc-offer", handleOffer)
      socket.off("webrtc-answer", handleAnswer)
      socket.off("webrtc-ice-candidate", handleIceCandidate)
      socket.off("player-mute-updated", handlePlayerMuteUpdated)
    }
  }, [joinedVoice])

  // Monitorar jogadores na sala para iniciar/fechar conexões
  useEffect(() => {
    if (!joinedVoice || !sala?.players) {
      if (!joinedVoice) cleanup()
      return
    }

    const currentPlayers = sala.players.map((p) => p.socketId)
    const myId = socket.id

    // Iniciar conexões com novos jogadores
    sala.players.forEach((player) => {
      const targetId = player.socketId
      if (targetId === myId) return

      // Decisão Mesh: Se o meu socket ID for alfabeticamente menor que o dele,
      // nós tomamos a iniciativa de criar a oferta de conexão (evita conexões duplicadas)
      const shouldInitiate = myId && myId < targetId

      if (!peersRef.current[targetId] && shouldInitiate) {
        initiateCall(targetId)
      }
    })

    // Fechar conexões de quem saiu da sala
    Object.keys(peersRef.current).forEach((targetId) => {
      if (!currentPlayers.includes(targetId)) {
        if (peersRef.current[targetId]) {
          peersRef.current[targetId].close()
          delete peersRef.current[targetId]
        }
        if (audioElementsRef.current[targetId]) {
          const el = audioElementsRef.current[targetId]
          if (el && el.parentNode) {
            el.parentNode.removeChild(el)
          }
          delete audioElementsRef.current[targetId]
        }
        setMutedPlayers((prev) => {
          const clone = { ...prev }
          delete clone[targetId]
          return clone
        })
      }
    })
  }, [sala?.players, joinedVoice])

  const getOrCreatePeer = (targetSocketId: string) => {
    if (peersRef.current[targetSocketId]) {
      return peersRef.current[targetSocketId]
    }

    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    }

    const pc = new RTCPeerConnection(configuration)

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc-ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        })
      }
    }

    // Quando receber stream remoto
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0]
      if (!remoteStream) return

      // Na Web, reproduzir o áudio criando um elemento oculto
      if (typeof window !== "undefined" && window.document) {
        // Remover elemento anterior se existir
        if (audioElementsRef.current[targetSocketId]) {
          const oldEl = audioElementsRef.current[targetSocketId]
          if (oldEl && oldEl.parentNode) oldEl.parentNode.removeChild(oldEl)
        }

        const audio = document.createElement("audio")
        audio.style.display = "none"
        audio.srcObject = remoteStream
        audio.autoplay = true
        audio.controls = false
        document.body.appendChild(audio)
        audioElementsRef.current[targetSocketId] = audio
      }
    }

    // Adicionar tracks locais na nova conexão
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track: any) => {
        pc.addTrack(track, localStreamRef.current)
      })
    }

    peersRef.current[targetSocketId] = pc
    return pc
  }

  const initiateCall = async (targetSocketId: string) => {
    try {
      const pc = getOrCreatePeer(targetSocketId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket.emit("webrtc-offer", {
        targetSocketId,
        sdp: offer,
      })
    } catch (err) {
      console.error("Erro ao iniciar chamada com", targetSocketId, err)
    }
  }

  const joinVoiceChat = async () => {
    if (!isSupported) return

    try {
      cleanup()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      localStreamRef.current = stream
      setJoinedVoice(true)

      // Garantir estado de mute correto
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !muted
      })

      // Emitir estado de mute atual para a sala
      if (sala?.codigo) {
        socket.emit("toggle-mute", { codigo: sala.codigo, muted })
      }
    } catch (err) {
      console.error("Falha ao obter microfone:", err)
      alert("Não foi possível acessar seu microfone. Verifique as permissões de áudio do seu dispositivo.")
    }
  }

  const leaveVoiceChat = () => {
    cleanup()
  }

  const toggleMute = () => {
    const newMuted = !muted
    setMuted(newMuted)

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track: any) => {
        track.enabled = !newMuted
      })
    }

    if (sala?.codigo) {
      socket.emit("toggle-mute", { codigo: sala.codigo, muted: newMuted })
    }
  }

  return (
    <VoiceContext.Provider
      value={{
        isSupported,
        muted,
        toggleMute,
        activeSpeakers,
        mutedPlayers,
        joinedVoice,
        joinVoiceChat,
        leaveVoiceChat,
      }}
    >
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoiceChat() {
  return useContext(VoiceContext)
}
