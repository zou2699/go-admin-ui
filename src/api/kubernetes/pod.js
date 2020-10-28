import request from '@/utils/request'

// 查询pod列表
export function listPod(namespaceName, labelSelector) {
  return request({
    url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/pods',
    method: 'get',
    params: labelSelector
  })
}

// // 查询podLog
// export function podLog(namespaceName, podName, query) {
//   return request({
//     url: '/k8s-api/api/v1/namespaces/' + namespaceName + '/pods/' + podName + '/log',
//     method: 'get',
//     params: query
//   })
// }

// 查询pod详细信息
// export function getPod(nodeName) {
//   return request({
//     url: '/k8s-api/api/v1/nodes/' + nodeName,
//     method: 'get'
//   })
// }
