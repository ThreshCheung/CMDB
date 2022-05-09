import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  console.log(TokenKey,token)
  return Cookies.set(TokenKey, 'ftx '+token,{expires:1})
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
