import request from '@/utils/request'

// 查询k8s deployment列表
export function listDeployment(namespaceName) {
  return request({
    url: '/k8s-api/apis/apps/v1/namespaces/' + namespaceName + '/deployments',
    method: 'get'
  })
}

// 查询deployment列表详细信息
export function getDeployment(namespaceName, deploymentName) {
  return request({
    url: '/k8s-api/apis/apps/v1/namespaces/' + namespaceName + '/deployments/' + deploymentName,
    method: 'get'
  })
}

// 重启deployment
export function restartDeployment(namespaceName, deploymentName) {
  return request({
    url: '/k8s-api/apis/apps/v1/namespaces/' + namespaceName + '/deployments/' + deploymentName,
    method: 'patch'
  })
}
