import storage from '@/utils/storage'

const state = {
  namespace: storage.get('K8s_namespace') || 'default'
}

const mutations = {
  CHANGE_NAMESPACE: (state, data) => {
    state.namespace = data
    storage.set('K8s_namespace', data)
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
