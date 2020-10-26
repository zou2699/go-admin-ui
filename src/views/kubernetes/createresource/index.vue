<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form
          ref="createForm"
          :rules="rules"
          :model="createParams"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="命名空间" prop="namespace">
            <el-select
              v-model="createParams.namespace"
              placeholder="请选择命名空间"
            >
              <el-option
                v-for="item in namespaceList"
                :key="item.metadata.name"
                :label="item.metadata.name"
                :value="item.metadata.name"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="资源类型" prop="kind" label-width="100px">
            <el-select v-model="createParams.kind" placeholder="请选择资源类型">
              <el-option
                v-for="item in kinds"
                :key="item.key"
                :label="item.display_name"
                :value="item.key"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <el-tabs v-model="activeName" type="card">
          <el-tab-pane label="Yaml 格式" name="yaml" />
          <el-tab-pane label="Json 格式" name="json" />
        </el-tabs>
        <div v-if="activeName == 'yaml'">
          <yaml-editor ref="yamlEditor" v-model="resourceYamlInfo" />
          <el-button
            v-permisaction="['createResource:createResource:create']"
            type="primary"
            icon="el-icon-position"
            size="medium"
            @click="handleCreate('yaml', resourceYamlInfo)"
          >创建</el-button>
        </div>
        <div v-if="activeName == 'json'">
          <json-editor ref="jsonEditor" v-model="resourceJsonInfo" />
          <el-button
            v-permisaction="['createResource:createResource:create']"
            type="primary"
            icon="el-icon-position"
            size="medium"
            @click="handleCreate('json', resourceJsonInfo)"
          >创建</el-button>
        </div>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import JsonEditor from '@/components/JsonEditor'
import YamlEditor from '@/components/YamlEditor'
import YAML from 'yamljs'
import { createResource } from '@/api/kubernetes/create'
import { listNamespace } from '@/api/kubernetes/namespace'
export default {
  name: 'CreateResource',
  components: { JsonEditor, YamlEditor },
  data() {
    return {
      // 遮罩层
      loading: true,
      activeName: 'yaml',
      kinds: [
        { key: 'deployment', display_name: 'deployment' },
        { key: 'service', display_name: 'service' },
        { key: 'gateway', display_name: 'gateway' },
        { key: 'virtualService', display_name: 'virtualService' },
        { key: 'serviceEntry', display_name: 'serviceEntry' },
        { key: 'destinationRule', display_name: 'destinationRule' }
      ],
      // 查询参数
      createParams: {
        namespace: 'default',
        kind: ''
      },

      // namespace列表
      namespaceList: [],
      // resourceInfo
      resourceYamlInfo: '',
      resourceJsonInfo: '',
      rules: {
        kind: [
          { required: true, message: '请选择资源类型', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getNamespaceList()
  },
  methods: {
    /** 查询参数列表 */
    getNamespaceList() {
      this.loading = true
      listNamespace().then((response) => {
        this.namespaceList = response.data.items
        this.loading = false
      })
    },
    yamlToJson(yamlStr) {
      var obj = YAML.parse(yamlStr)
      var jsonStr = JSON.stringify(obj)
      return jsonStr
    },
    handleCreate(type, data) {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          const namespace = this.createParams.namespace
          const kind = this.createParams.kind
          this.$confirm('是否创建 ' + namespace + '/' + kind + ' ?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // console.log(namespace, kind, type);
            // console.log(data);
            if (type === 'yaml') {
              data = this.yamlToJson(data)
            }
            // console.log(data);
            createResource(namespace, kind, data).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('创建成功')
              } else {
                this.msgError(response.msg)
              }
            })
          })
        }
      })
    }
  }
}
</script>

