<template>
  <div>
    <div class="status-bar">  {{ namespaceName }} - {{ podName }} / {{ containerName }}
      <span v-if="status === 'ok'" class="ws-status-ok">{{ shell }} 已连接</span>
      <template v-else>
        <el-button type="warning" size="mini" class="ws-reconnect" @click="reconnect">重连</el-button>
        `        <span class="ws-status-err"> 已断开</span>
        `      </template>
    </div>
    <div ref="terminal" class="console" />
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

export default {
  name: 'PodExec',
  // props: {
  //   socketURI: {
  //     type: String,
  //     default: ''
  //   }
  // },
  data() {
    return {
      namespaceName: '',
      podName: '',
      containerName: '',
      shell: 'sh',
      status: '',
      term: '',
      socketURI: '',
      rows: 90,
      cols: 100
    }
  },
  created() {
    const WsHost = process.env.VUE_APP_BASE_API.replace('http', 'ws')
    this.namespaceName = this.$route.params.namespace
    this.podName = this.$route.params.pod
    this.containerName = this.$route.params.container
    this.shell = this.$route.query.shell
    if (!this.shell) {
      this.shell = 'sh'
    }
    // 构造socketURI
    this.socketURI = WsHost + '/k8s-api/api/v1/namespaces/' +
                     this.namespaceName + '/pods/' + this.podName + '/exec?' +
                     'shell=' + this.shell + '&container=' + this.containerName
  },
  mounted() {
    this.initSocket()
  },
  beforeDestroy() {
    this.socket.close()
    this.term.dispose()
  },
  methods: {
    initTerm() {
      const _this = this
      const term = new Terminal({
        fontSize: 14,
        scrollback: 5000, // 回滚
        cols: parseInt(_this.rows),
        rows: parseInt(_this.cols),
        cursorBlink: true // 光标闪烁
        // theme: {
        //   foreground: 'yellow', // 字体
        //   background: '#060101', // 背景色
        //   cursor: 'help' // 设置光标
        // }
      })
      // xterm的socket组件与websocket实例结合
      // const attachAddon = new AttachAddon(this.socket)
      // term.loadAddon(attachAddon)
      term.open(this.$refs.terminal)

      // 加载自适应组件
      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      fitAddon.fit()
      // 在绑定的组件上初始化窗口

      // 换行并输入起始符“$”
      // term.prompt = () => {
      //   term.write('\r\n$ ')
      // }
      // term.prompt()

      // resize窗口
      function resizeScreen() {
        try {
          fitAddon.fit()

          // 窗口大小改变时触发xterm的resize方法，向后端发送行列数，格式由后端决定
          // 这里不使用size默认参数，因为改变窗口大小只会改变size中的列数而不能改变行数，所以这里不使用size.clos,而直接使用获取我们根据窗口大小计算出来的行列数
          term.onResize(() => {
            // console.log({ Op: 'resize', Cols: term.cols, Rows: term.rows })
            _this.socketonSend({ Op: 'resize', Cols: term.cols, Rows: term.rows })
          })
        } catch (e) {
          console.log('e', e.message)
        }
      }
      window.addEventListener('resize', resizeScreen)

      function runFakeTerminal(_this) {
        if (_this.term._initialized) {
          return
        }

        term.writeln('Welcome to use \x1B[1;3;31m go-admin. \x1B[0m')
        // term.writeln(
        //   `This is Web Terminal of container\x1B[1;3;31m ${
        //     _this.podName} - ${_this.containerName}
        //   \x1B[0m in namespace\x1B[1;3;31m ${_this.namespaceName}\x1B[0m`
        // )
        // term.prompt()

        // 监听数据事件 xterm 4.*
        term.onData(function(key) {
          const order = {
            Data: key,
            Op: 'stdin'
          }
          _this.socketonSend(order)
        // 为解决窗体resize方法才会向后端发送列数和行数，所以页面加载时也要触发此方法
        // _this.onSend({
        //   Op: 'resize',
        //   Cols: parseInt(term.cols),
        //   Rows: parseInt(term.rows)
        // })
        })
        // 聚焦
        term.focus()
        term.scrollToBottom()
        // 初始化完成
        term._initialized = true
        _this.term = term
      }
      runFakeTerminal(_this)
      this.status = 'ok'
    },
    initSocket() {
      this.socket = new WebSocket(this.socketURI, getToken())
      this.socketonMessage()
      this.socketOnClose()
      this.socketOnOpen()
      this.socketOnError()
    },
    socketOnOpen() {
      this.socket.onopen = () => {
        // 链接成功后
        this.initTerm()
      }
    },
    socketOnClose() {
      this.socket.onclose = () => {
        this.status = ''
        console.log('close socket')
      }
    },
    socketOnError() {
      this.socket.onerror = () => {
        this.status = ''
        console.log('socket 链接失败')
      }
    },
    socketonMessage() {
      this.socket.onmessage = e => {
        // console.log(e)
        const data = JSON.parse(e.data)

        // 打印后端返回的数据
        this.term.write(data.Data)
      }
    },
    socketonSend(data) {
      data = JSON.stringify(data)
      this.socket.send(data)
    },
    reconnect() {
      this.initSocket()
      console.log('reconnect')
    }
  }
}
</script>

<style lang="scss"  scoped>
.status-bar {
  background-color: rgb(58, 51, 51);
  color: rgb(255, 254, 255);
  font-weight: 500;
  padding: 8px 20px;
  line-height: 22px;
  text-align: center;

  .ws-status-ok {
    float: right;
    font-size: 14px;
    font-weight: 600;
    color: rgb(51, 255, 51);
  }
   .ws-status-err {
     float: right;
     font-size: 14px;
     font-weight: 600;
     color: rgb(255, 102, 0);
   }
      .ws-reconnect {
     float: right;
     font-size: 14px;
     font-weight: 600;
     color: rgb(255, 102, 0);
   }
}

</style>

