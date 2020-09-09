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
              <el-form ref="form" :model="deploymentInfo" label-position="left" label-width="150px">
                <el-form-item label="服务名称">
                  <span>{{ deploymentInfo.metadata.namespace }} / {{ deploymentInfo.metadata.name }}</span>
                </el-form-item>
                <el-form-item label="服务类型">
                  <span>Deployment</span>
                </el-form-item>
                <el-form-item label="副本数">
                  <span>{{ deploymentInfo.status.availableReplicas }} / {{ deploymentInfo.status.replicas }}</span>
                </el-form-item>
                <el-form-item label="标签">
                  <span v-for="(value,name) in deploymentInfo.metadata.labels" :key="name">
                    <el-tag>{{ name }}:{{ value }}</el-tag>
                  </span>
                </el-form-item>
                <el-form-item label="Selector">
                  <span
                    v-for="(value,name) in deploymentInfo.spec.selector.matchLabels"
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
              <el-table :stripe="true" style="width: 100%" :data="deploymentInfo.status.conditions">
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

          <el-col :span="8">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>部署策略</span>
              </div>
              <el-table :stripe="true" style="width: 100%" :data="deploymentInfo.status.conditions">
                <el-table-column label="type" prop="type" />
                <el-table-column label="status" prop="status" />
                <el-table-column label="message" prop="message" />
                <el-table-column label="reason" prop="reason" />
                <el-table-column label="lastUpdateTime" prop="lastUpdateTime" />
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>service信息</span>
              </div>
              <el-table :stripe="true" style="width: 100%" :data="deploymentInfo.status.conditions">
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
          <el-col :span="8">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>Pod信息</span>
              </div>
              <el-table :stripe="true" style="width: 100%" :data="deploymentInfo.status.conditions">
                <el-table-column label="type" prop="type" />
                <el-table-column label="status" prop="status" />
                <el-table-column label="message" prop="message" />
                <el-table-column label="reason" prop="reason" />
                <el-table-column label="lastUpdateTime" prop="lastUpdateTime" />
              </el-table>
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="second-box-card">
              <div slot="header" class="clearfix">
                <span>Pod信息2</span>
              </div>
              <el-table :stripe="true" style="width: 100%" :data="deploymentInfo.status.conditions">
                <el-table-column label="type" prop="type" />
                <el-table-column label="status" prop="status" />
                <el-table-column label="message" prop="message" />
                <el-table-column label="reason" prop="reason" />
                <el-table-column label="lastUpdateTime" prop="lastUpdateTime" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { getDeployment } from '@/api/kubernetes/deployment'

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
          }
        },
        status: {
          replicas: 0,
          availableReplicas: 0,
          conditions: []
        }
      }
    }
  },
  created() {
    const namespace = this.$route.params && this.$route.params.namespace
    const deployment = this.$route.params && this.$route.params.name
    this.queryDetail(namespace, deployment)
  },

  methods: {
    /** 查询详细信息按钮操作 */
    queryDetail(namespaceName, deploymentName) {
      getDeployment(namespaceName, deploymentName).then((response) => {
        this.deploymentInfo = response.data
      })
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
