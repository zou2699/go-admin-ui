const state = {
  namespace: 'default' }

const mutations = {
  CHANGE_NAMESPACE: (state, data) => {
    state.namespace = data
  }
}

const actions = {
  changeNamespace({ commit }, data) {
    console.log(data)
    commit('CHANGE_NAMESPACE', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
