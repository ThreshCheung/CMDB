<template>
  <el-container>
    <el-main>
      
        <el-card shadow="hover" style="overflow: auto">
          <div slot="header">
            <span>选择服务器</span>
          </div>
          <div>
            <el-input
              placeholder="输入关键字进行过滤"
              v-model="filterText"
              style="margin-bottom: 5px"
            >
            </el-input>
            <el-scrollbar style="height: 690px">
              <el-tree
                indent:8
                :data="baseData"
                :props="defaultProps"
                :filter-node-method="filterNode"
                ref="tree"
                @node-click="selectHost"
              >
              </el-tree>
            </el-scrollbar>
          </div>
        </el-card>
    </el-main>
    <el-main>
        <el-card shadow="hover" style="height: 790px">
          <div slot="header">
            <!--            <span>Console</span>-->
            <span>WebShell 十分钟后自动断开连接</span>
          </div>
          <el-tabs
            closable
            type="card"
            :value="JSON.stringify(parseInt(currentIndex))"
            @tab-remove="handleTabRemove"
          >
            <el-tab-pane
              v-for="terminal in this.terminalList"
              :key="terminal.id"
              :name="JSON.stringify(terminal.pid)"
              :label="
                terminal.inner_ip
                  ? terminal.inner_ip +
                    '【' +
                    JSON.stringify(terminal.pid + 1) +
                    '】'
                  : '请选择连接'
              "
            >
              <div
                class="console"
                :id="'terminal-' + JSON.stringify(terminal.pid)"
              ></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
    </el-main>
  </el-container>
</template>

<script>
import "xterm/lib/xterm.css";
// import { Terminal } from 'xterm'
import { Terminal } from "xterm";
// import { httpGet, httpPost } from "../../../api/sys/http";
export default {
  // name 值和本页的 $route.name 一致才可以缓存页面
  name: "webshell",
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  data() {
    return {
      p: "webssh",
      table: [],
      loading: false,
      node: "",
      filterText: "",
      userWebSSHView: "",
      baseData: [],
      term: null,
      terminalSocket: null,
      scrollWidth: "",
      terminalList: [
        {
          pid: 0,
          name: "terminal",
          cols: 80,
          rows: 30,
          inner_ip: "",
          tab: true,
        },
      ],
      form: {
        host_id: "",
      },
      connectHost: {},
      allsearchdata: [],
      tab0: true,
      currentIndex: "0",
      tabIndex: "",
      terminalContainer: "",
      defaultProps: {
        children: "children",
        label: "title",
      },
    };
  },

  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.title.indexOf(value) !== -1;
    },
    selectHost(val) {
      if (val.cpu) {
        this.connectHost = val;
        this.sumbitWebSock();
      } else {
        this.connectHost = "";
      }
    },
    handleTab(vl) {
      this.currentIndex = vl;
    },
    handleTabRemove(vl) {
      if (this.terminalList.length === 1) {
        window.location.reload();
      } else {
        this.terminalList[vl].tab = false;
        this.findSessionOnline(vl);
      }
    },
    findSessionOnline(vl) {
      if (vl === "0") {
        // 往上一个一个找标签，如果找到的标签会话是可用的，为true的话即打开
        let ifpid = true;
        for (let gg = 1; gg < this.terminalList.length; gg++) {
          if (this.terminalList[gg].tab) {
            this.currentIndex = JSON.stringify(this.terminalList[gg].pid);
            ifpid = false;
            break;
          }
        }
        if (ifpid) {
          window.location.reload();
        }
      } else {
        let ifpid = true;
        for (let gg = vl; gg < this.terminalList.length; gg++) {
          if (this.terminalList[gg].tab) {
            this.currentIndex = JSON.stringify(this.terminalList[gg].pid);
            ifpid = false;
            break;
          }
        }
        if (ifpid) {
          for (let gg = vl; gg >= 0; gg--) {
            if (this.terminalList[gg].tab) {
              this.currentIndex = JSON.stringify(this.terminalList[gg].pid);
              ifpid = false;
              break;
            }
          }
        }
        if (ifpid) {
          window.location.reload();
        }
      }
    },
    async sumbitWebSock() {
      var host_id = {};
      this.form.host_id = this.connectHost.id;
      // 第一次打开的时候会话在第一个窗口打开
      if (
        (this.terminalList.length === 1 && !this.terminalList[0].inner_ip) ||
        (this.terminalList.length === 1 && this.terminalList[0].loggingFalure)
      ) {
        this.terminalList = [
          {
            pid: 0,
            name: "terminal",
            cols: 80,
            rows: 30,
            inner_ip: this.connectHost.lan_ip,
            tab: true,
          },
        ];
      } else {
        this.terminalList.push({
          pid: this.terminalList.length,
          name: "terminal",
          cols: 80,
          rows: 30,
          inner_ip: this.connectHost.lan_ip,
          tab: true,
        });
        this.currentIndex = JSON.stringify(this.terminalList.length - 1);
      }
      this.loading = true;
      console.log(host_id);
      const result = await this.$API.sshList.reqWsId(this.form);
      let wsid = result.data.ws_id;
      this.websshConnect(`ws://192.168.12.136:8001/ssh/ws?id=` + wsid);
      //   httpPost("/ssh", {
      //     host_id,
      //   }).then((res) => {
      //     console.log(res.data);
      //     let wsid = res.data.ws_id;
      //     this.websshConnect(`ws://localhost:8001/ssh/ws?id=` + wsid);
      //   });
    },
    runRealTerminal() {
      console.log("webSocket is finished");
      // 自适应宽度
      this.term.resize(
        Math.round(document.body.scrollWidth * (135 / 1920)),
        40
      );
      this.terminalSocket.send(
        JSON.stringify({
          resize: [Math.round(document.body.scrollWidth * (135 / 1920)), 40],
        })
      );
    },
    errorRealTerminal() {
      console.log("errorRealTerminalerrorRealTerminalerrorRealTerminal");
      this.$notify({
        title: "会话已超时或已推出会话！！",
        type: "info",
      });
    },
    closeRealTerminal() {
      console.log("errorRealTerminalerrorRealTerminalerrorRealTerminal");
      this.$notify({
        title: "会话已超时或已推出会话！！",
        type: "info",
      });
    },
    destoryConnection() {
      if (this.terminalSocket) {
        this.terminalSocket.close();
        this.term.destroy();
      }
    },
    websshConnect(url) {
      try {
        if (this.terminalSocket) {
          this.termInit();
          // this.hotkeysInit()
        }
        console.log(url);
        this.terminalSocket = new WebSocket(url);
        console.log("build websocket");
        this.terminalSocket.onopen = this.runRealTerminal;
        this.terminalSocket.onclose = this.closeRealTerminal;
        this.terminalSocket.onerror = this.errorRealTerminal;
        this.term.attach(this.terminalSocket);
        this.term._initialized = true;
        var t = this.terminalSocket;
        var scrollWidth = document.body.scrollWidth;
        var e = this.term;
        this.term.on("data", function (data) {
          // 监听如果浏览器宽度有变化的话将改变resize
          if (scrollWidth !== document.body.scrollWidth) {
            e.resize(Math.round(document.body.scrollWidth * (135 / 1920)), 40);
            t.send(
              JSON.stringify({
                resize: [
                  Math.round(document.body.scrollWidth * (135 / 1920)),
                  40,
                ],
              })
            );
            scrollWidth = document.body.scrollWidth;
          }
          if (data.length) {
            t.send(JSON.stringify({ data: data }));
          }
        });
      } catch (e) {
        this.$notify({
          title: "websshConnect 会话已超时或已推出会话！！",
          type: "warning",
        });
      }
      console.log("mounted is going on");
    },
    async initpro() {
      const result = await this.$API.sshList.reqSshList(this.p);

      // console.log(this.sshList[1].children[0].children[0].id);
      //   this.sshList = result.data;
      //   console.log(this.sshList);
      //   httpGet(
      //     '/api/v1/projects/', {
      //       p: 'webssh'
      //     })
      //     .then(res => {
      for (var i = 0; i < result.data.length; i++) {
        result.data[i]["expend"] = true;
      }
      this.baseData.push({
        title: "业务列表",
        expand: true,
        children: result.data,
        top: 1,
      });
            console.log(this.baseData)
      //     })
    },
    termInit() {
      let terminalContainer = document.getElementById(
        "terminal-" + JSON.stringify(this.terminalList[this.currentIndex].pid)
      );
      console.log(
        "terminal-" + JSON.stringify(this.terminalList[this.currentIndex].pid)
      );
      this.term = new Terminal({
        cursorBlink: true,
        cols: this.terminalList[this.currentIndex].cols,
        rows: this.terminalList[this.currentIndex].rows,
      });
      this.term.open(terminalContainer);
    },
  },
  mounted() {
    this.initpro();
    this.termInit();
  },
  beforeDestroy() {
    if (this.globalWs) {
      this.globalWs.close();
      this.globalWs = null;
    }
  },
};
</script>
