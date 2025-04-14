import AsyncStorage from "@react-native-async-storage/async-storage"

export async function saveObjectDataAsyncStorage (key: string, data: any) {
  try {
    const parsed = JSON.stringify(data)
    await AsyncStorage.setItem(key, parsed)
  } catch (error) {
    throw new Error("Não foi possível salvar o objeto")
  }
}