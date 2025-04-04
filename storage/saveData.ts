import AsyncStorage from "@react-native-async-storage/async-storage"

export async function saveDataAsyncStorage (key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (error) {
    throw new Error("Não foi possível realizar a busca")
  }
}

export async function saveObjectDataAsyncStorage (key: string, data: any) {
  try {
    const parsed = JSON.stringify(data)
    await AsyncStorage.setItem(key, parsed)
  } catch (error) {
    throw new Error("Não foi possível realizar a busca")
  }
}