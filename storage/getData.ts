import AsyncStorage from "@react-native-async-storage/async-storage"

export async function getDataAsyncStorage (key: string) {
  try {
    return await AsyncStorage.getItem(key)
  } catch (error) {
    throw new Error("Não foi possível realizar a busca")
  }
}

export async function getObjectDataAsyncStorage (key: string) {
  try {
    const result = await AsyncStorage.getItem(key)

    return result ? JSON.parse(result) : {undefined}
  } catch (error) {
    throw new Error("Não foi possível realizar a busca")
  }
}