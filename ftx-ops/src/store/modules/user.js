import { login, logout, } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    prov:[],
    id:0
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_PROV: (state, prov) => {
    state.prov = prov
  },
  SET_ID: (state, id) => {
    state.id = id
  },
}

const actions = {
  // user login 处理登录业务
  async login({ commit }, userInfo) {
    //解构用户名和密码
    const { username, password } = userInfo
    let result = await login({ username: username.trim(), password: password })
    console.log(result);
    if (result.code === 20000) {
      commit('SET_TOKEN', result.token)
      commit('SET_NAME', result.name)
      commit('SET_PROV', result.prov)
      setToken(result.token)
      console.log('PromiseOk');
      // localStorage.setItem("store", JSON.stringify(this.$store.state));
      return 'ok'
    } else {
      console.log('PromiseError');
      return Promise.reject(new Error('failed'))
    }
  },

  // // get user info
  // getInfo({ commit, state }) {
  //   return new Promise((resolve, reject) => {
  //     getInfo(state.token).then(response => {
  //       const { data } = response

  //       if (!data) {
  //         return reject('Verification failed, please Login again.')
  //       }

  //       const { name, avatar } = data

  //       commit('SET_NAME', name)
  //       commit('SET_AVATAR', avatar)
  //       resolve(data)
  //     }).catch(error => {
  //       reject(error)
  //     })
  //   })
  // },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

