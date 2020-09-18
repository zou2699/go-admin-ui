import request from '@/utils/request'

// 查询Event列表
export function listEvent(namespaceName) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/events',
    method: 'get'
  })
}

// watch event列表
export function watchEventList(namespaceName, query) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/events',
    method: 'get',
    params: query
  })
}
