<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-row :gutter="12" class="el-row">
          <el-col :span="9">
            <el-card class="first-box-card">
              <div slot="header" class="clearfix">
                <span>基本信息</span>
              </div>
              <el-form
                ref="form"
                :model="deploymentInfo"
                label-position="left"
                label-width="150px"
              >
                <el-form-item label="服务名称">
                  <span>{{ deploymentInfo.metadata.namespace }} /
                    {{ deploymentInfo.metadata.name }}</span>
                </el-form-item>
                <el-form-item label="服务类型">
                  <span>Deployment</span>
                </el-form-item>
                <el-form-item label="副本数">
                  <span>{{ deploymentInfo.status.availableReplicas }} /
                    {{ deploymentInfo.status.replicas }}</span>
                </el-form-item>
                <el-form-item label="标签">
                  <span
                    v-for="(value, name) in deploymentInfo.metadata.labels"
                    :key="name"
                  >
                    <el-tag>{{ name }}:{{ value }}</el-tag>
                  </span>
                </el-form-item>
                <el-form-item label="Selector">
                  <span
                    v-for="(value, name) in deploymentInfo.spec.selector
                      .matchLabels"
                    :key="name"
                  >
                    <el-tag>{{ name }}:{{ value }}</el-tag>
                  </span>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <el-col :span="15">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>运行时信息</span>
              </div>
              <el-table
                :stripe="true"
                style="width: 100%"
                :data="deploymentInfo.status.conditions"
              >
                <el-table-column label="type" prop="type" />
                <el-table-column label="status" prop="status" />
                <el-table-column label="message" prop="message" />
                <el-table-column label="reason" prop="reason" />
                <el-table-column label="lastUpdateTime" prop="lastUpdateTime" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="12" class="el-row">
          <el-col :span="12">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>部署策略</span>
              </div>
              <el-form
                ref="form"
                :model="deploymentInfo"
                label-position="left"
                label-width="150px"
              >
                <el-form-item label="类型">
                  <span>{{ deploymentInfo.spec.strategy.type }}</span>
                </el-form-item>
                <span v-if="deploymentInfo.spec.strategy.type === 'Recreate'">使用重新创建的部署策略时，先删除旧副本集中的所有 Pod，且删除成功后，再创建新副本集中的 Pod。将有一段时间应用程序不可用。</span>
                <template v-if="deploymentInfo.spec.strategy.type === 'RollingUpdate'">
                  <el-form-item label="滚动更新">
                    <div>
                      <el-form
                        ref="form"
                        :model="deploymentInfo.spec.strategy.rollingUpdate"
                        label-position="left"
                        label-width="150px"
                      >
                        <el-form-item label="最大超出副本数">
                          <span>{{
                            deploymentInfo.spec.strategy.rollingUpdate
                              .maxUnavailable
                          }}</span>
                        </el-form-item>
                        <el-form-item label="最大不可用副本数">
                          <span>{{
                            deploymentInfo.spec.strategy.rollingUpdate.maxSurge
                          }}</span>
                        </el-form-item>
                      </el-form></div></el-form-item></template>
              </el-form></el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>service信息</span>
              </div>
              <el-form
                ref="form"
                :model="serviceInfo"
                label-position="left"
                label-width="150px"
              >
                <el-form-item label="类型">
                  <span>{{ serviceInfo.spec.type }}</span>
                </el-form-item>
                <el-form-item label="clusterIP">
                  <span>{{ serviceInfo.spec.clusterIP }}</span>
                </el-form-item>
              </el-form>

              <span>访问端口</span>
              <el-card>
                <el-table :data="serviceInfo.spec.ports">
                  <el-table-column label="名称" prop="name" />
                  <el-table-column label="协议" prop="protocol" />
                  <el-table-column label="服务端口" prop="port" />
                  <el-table-column label="容器端口" prop="targetPort" />
                  <el-table-column
                    v-if="serviceInfo.spec.type == 'NodePort'"
                    label="nodePort"
                    prop="nodePort"
                  />
                </el-table>
              </el-card>
            </el-card>
          </el-col>

        </el-row>

        <el-row :gutter="12" class="el-row">
          <el-col :span="12">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>副本集 ReplicaSets</span>
                <el-table :data="replicasetList" height="350px">
                  <el-table-column label="名称" prop="metadata.name" />
                  <el-table-column label="期望" prop="status.replicas" />
                  <el-table-column label="当前" prop="status.availableReplicas" />
                  <el-table-column label="就绪" prop="status.readyReplicas" />
                  <el-table-column label="已创建">
                    <template slot-scope="scope">{{
                      scope.row.metadata.creationTimestamp | timeStringAgo
                    }}</template>
                  </el-table-column>
                  <el-table-column label="版本">
                    <template slot-scope="scope">{{
                      scope.row.metadata.annotations['deployment.kubernetes.io/revision']
                    }}</template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-col>

          <el-col :span="12">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>当前副本集 {{ replicasetInfo.metadata.name }} 所管理的副本 Pods</span>
                <el-table :data="podList" height="350px" @row-click="changePodInfo">
                  <el-table-column label="名称" prop="metadata.name" />
                  <el-table-column label="Phase" prop="status.phase" />
                  <el-table-column label="Ready">
                    <template slot-scope="scope">{{
                      scope.row.status.conditions[1].status
                    }}</template>
                  </el-table-column>
                  <el-table-column label="已创建">
                    <template slot-scope="scope">{{
                      scope.row.metadata.creationTimestamp | timeStringAgo
                    }}</template>
                  </el-table-column>
                  <el-table-column label="nodeName" prop="spec.nodeName" />
                  <el-table-column label="PodIP" prop="status.podIP" />
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-divider content-position="center">{{ podInfo.metadata.name }}</el-divider>

        <el-row :gutter="12" class="el-row">
          <el-col v-for="(initContainer,index) in podInfo.spec.initContainers" :key="index+1000" :span="8">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>{{ initContainer.name }}</span>

                <el-form
                  ref="form"
                  :model="initContainer"
                  label-position="left"
                  label-width="150px"
                >
                  <el-form-item label="镜像">
                    <span>{{ initContainer.image }}</span>
                  </el-form-item>
                  <el-form-item label="抓取策略">
                    <span>{{ initContainer.imagePullPolicy }}</span>
                  </el-form-item>
                  <el-form-item label="就绪">
                    <span>{{ podInfo.status.initContainerStatuses[index].ready }}</span>
                  </el-form-item>
                  <el-form-item label="重启次数">
                    <span>{{ podInfo.status.initContainerStatuses[index].restartCount }}</span>
                  </el-form-item>
                  <el-form-item label="状态">
                    <span>{{ Object.keys(podInfo.status.initContainerStatuses[index].state)[0] }}</span>
                  </el-form-item>
                </el-form>
                <router-link
                  target="_blank"
                  :to="
                    '/ext/kubernetes/pod/log/' +
                      podInfo.metadata.namespace +
                      '/' +
                      podInfo.metadata.name +
                      '/' +
                      initContainer.name
                  "
                >
                  <el-button
                    v-permisaction="['pod:pod:log']"
                    type="text"
                    icon="el-icon-info"
                  >查看日志</el-button>
                </router-link>
              </div>
            </el-card>
          </el-col>

          <el-col v-for="(container,index) in podInfo.spec.containers" :key="index" :span="8">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>{{ container.name }}</span>

                <el-form
                  ref="form"
                  :model="container"
                  label-position="left"
                  label-width="150px"
                >
                  <el-form-item label="镜像">
                    <span>{{ container.image }}</span>
                  </el-form-item>
                  <el-form-item label="抓取策略">
                    <span>{{ container.imagePullPolicy }}</span>
                  </el-form-item>
                  <el-form-item label="就绪">
                    <span>{{ podInfo.status.containerStatuses[index].ready }}</span>
                  </el-form-item>
                  <el-form-item label="重启次数">
                    <span>{{ podInfo.status.containerStatuses[index].restartCount }}</span>
                  </el-form-item>
                  <el-form-item label="状态">
                    <span>{{ Object.keys(podInfo.status.containerStatuses[index].state)[0] }}</span>
                  </el-form-item>
                </el-form>
                <router-link
                  target="_blank"
                  :to="
                    '/ext/kubernetes/pod/log/' +
                      podInfo.metadata.namespace +
                      '/' +
                      podInfo.metadata.name +
                      '/' +
                      container.name
                  "
                >
                  <el-button
                    v-permisaction="['pod:pod:log']"
                    type="text"
                    icon="el-icon-info"
                  >查看日志</el-button>
                </router-link>
              </div>
            </el-card>
          </el-col>

        </el-row>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getDeployment } from '@/api/kubernetes/deployment'
import { getService } from '@/api/kubernetes/service'
import { listReplicaset } from '@/api/kubernetes/replicaset'
import { listPod } from '@/api/kubernetes/pod'

export default {
  name: 'DeploymentInfo',
  data() {
    return {
      namespaceName: '',
      deploymentName: '',
      deploymentInfo: {
        metadata: {
          namespace: '',
          name: '',
          labels: {}
        },
        spec: {
          selector: {
            matchLabels: {}
          },
          strategy: {
            rollingUpdate: {}
          }
        },
        status: {}
      },
      serviceInfo: {
        spec: {},
        ports: [],
        clusterIP: '',
        type: ''
      },
      replicasetList: [],
      replicasetInfo: {
        metadata: {
          name: ''
        }
      },
      podList: [],
      podInfo: {
        metadata: {
          name: ''
        },
        spec: {
          initContainers: []
        }
      },
      queryParams: {},
      deploymentSelector: undefined,
      rsSelector: undefined
    }
  },
  created() {
    const namespace = this.$route.params && this.$route.params.namespace
    const deployment = this.$route.params && this.$route.params.name
    this.queryDeployment(namespace, deployment)
    this.queryService(namespace, deployment)
  },

  methods: {
    /** 查询详细信息按钮操作 */
    async queryDeployment(namespaceName, deploymentName) {
      // 获取Deployment信息
      await this.getDeploymentInfo(namespaceName, deploymentName)
      // 获取Deployment的label信息
      const matchLabels = this.deploymentInfo.spec.selector.matchLabels
      let label = ''
      for (const i in matchLabels) {
        label += i + '=' + matchLabels[i] + ','
      }
      label = label.substr(0, label.length - 1)

      // 查询 rs 信息
      this.queryParams.labelSelector = label
      await this.getReplicasetList(namespaceName, this.queryParams)
      // 查询 pod 信息
      label = ''
      for (const i in matchLabels) {
        label += i + '=' + matchLabels[i] + ','
      }
      label = label.substr(0, label.length - 1)
      this.queryParams.labelSelector = label
      await this.getPodList(namespaceName, this.queryParams)
    },
    queryService(namespaceName, deploymentName) {
      getService(namespaceName, deploymentName).then((response) => {
        this.serviceInfo = response.data
      }).catch(() => {})
    },
    // 获取Deployment信息
    async getDeploymentInfo(namespaceName, deploymentName) {
      return await getDeployment(namespaceName, deploymentName).then((response) => {
        this.deploymentInfo = response.data
      })
    },
    async getReplicasetList(namespaceName, labelSelector) {
      return await listReplicaset(namespaceName, labelSelector).then((response) => {
        this.replicasetList = response.data.items
        this.replicasetInfo = response.data.items[0]
      })
    },
    async getPodList(namespaceName, labelSelector) {
      return await listPod(namespaceName, labelSelector).then((response) => {
        this.podList = response.data.items
        this.podInfo = response.data.items[0]
      })
    },
    changePodInfo(row, column, event) {
      this.podInfo = row
    },
    findContainerStatus(name) {
      function findResult(data) {
        return data.name === name
      }
      return this.podInfo.status.containerStatuses.find(findResult)
    }
  }
}
</script>

<style lang="scss" scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.first-box-card {
  width: 1;
  height: 100%;
}
.second-box-card {
  width: 480;
  height: 100%;
}
.el-row {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
}
</style>
