import request from '@/utils/request'

// 查询replicasets列表
export function listReplicaset(namespaceName, labelSelector) {
  return request({
    url: '/k8s-api/apis/apps/v1/namespaces/' + namespaceName + '/replicasets',
    method: 'get',
    params: labelSelector
  })
}
