<template>
  <el-container>
    <el-header>
      <div>
        <el-input
          type="captcha"
          placeholder="搜索"
          style="text-align: left; width: 40%"
          v-model="q"
        >
        </el-input
        ><el-button
          type="primary"
          style="display: inline; margin-left: 20px"
          @click="handleSearch"
          >搜索</el-button
        >
        <el-button
          type="primary"
          @click="newRefresh"
          style="display: inline; margin-left: 800px"
          >新建任务</el-button
        >
      </div>
    </el-header>
    <el-main>
      <div>
        <el-table style="width: 100%" :data="CDNLogList">
          <el-table-column
            prop="domain_url"
            label="域名"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="" label="内容" width="width" align="center">
            <template slot-scope="{ row }">
              <ul>
                <li v-for="(value, key, index) in row.content" :key="index">
                  {{ value }}
                </li>
              </ul>
            </template>
          </el-table-column>
          <el-table-column
            prop="user"
            label="动作"
            width="width"
            align="center"
          >
            <template slot-scope="{ row }">
              <span v-if="row.action == 'push'">预热</span>
              <span v-if="row.action == 'refresh'">刷新</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="create_time"
            sortable
            label="创建时间"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="user"
            label="执行人"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="status"
            label="执行状态"
            width="width"
            align="center"
          >
            <template slot-scope="{ row }">
              <el-tag type="primary" v-if="row.status == 'process'"
                >进行中</el-tag
              >
              <el-tag type="danger" v-if="row.status == 'failed'">失败</el-tag>
              <el-tag type="success" v-if="row.status == 'done'">成功</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="" label="" width="width" align="center">
            <template slot-scope="{ row }">
              <el-link type="primary" @click="showDialog(row.log)"
                >任务详情</el-link
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="margin-top: 20px; text-align: center"
          :current-page="currentPage"
          :page-sizes="[10, 15, 20]"
          :page-size="pageSize"
          layout=" prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        >
        </el-pagination>
        <el-dialog
          title="任务详情"
          :visible.sync="dialogVisible"
          @close="handleCancel"
        >
          <template>
            <el-table style="width: 100%" :data="logData">
              <el-table-column
                prop="Url"
                label="url"
                width="width"
                align="center"
              >
              </el-table-column>
              <el-table-column
                prop="CreateTime"
                label="执行时间"
                width="width"
                align="center"
              >
              </el-table-column>
              <el-table-column
                prop="status"
                label="执行状态"
                width="width"
                align="center"
              >
                <template slot-scope="{ row }">
                  <el-tag type="primary" v-if="row.Status == 'process'"
                    >进行中</el-tag
                  >
                  <el-tag type="danger" v-if="row.Status == 'failed'"
                    >失败</el-tag
                  >
                  <el-tag type="success" v-if="row.Status == 'done'"
                    >成功</el-tag
                  >
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-dialog>
        <el-dialog
          title="新建任务"
          :visible.sync="dialogVisible1"
          @close="handleCancel"
        >
          <template>
            <div class="app-container">
              <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="域名:">
                  <el-select
                    v-model="form.url"
                    placeholder="请选择DomainID"
                    @change="handleSelectChange"
                    style="width: 300px"
                  >
                    <el-option
                      v-for="item in DomainIDList"
                      :key="item.id"
                      :label="item.url"
                      :value="item.url"
                    >
                      <span style="float: left; color: #8492a6; font-size: 13px"
                        >{{ item.env }}&nbsp;&nbsp;&nbsp;&nbsp;</span
                      >
                      <span style="float: right"
                        >&nbsp;&nbsp;&nbsp;&nbsp;{{ item.url }}</span
                      >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="刷新内容:">
                  <el-input
                    v-model="content"
                    placeholder="请输入刷新或预热地址（注意格式应为'/'开头 不同内容之间用','隔开 例如：/,/test）"
                    @input="handleInput"
                  ></el-input>
                </el-form-item>
                <el-form-item label="内容类型:">
                  <el-radio-group v-model="form.obj_type" style="">
                    <el-radio label="Directory">目录</el-radio>
                    <el-radio label="File">文件</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="操作类型:">
                  <el-radio-group v-model="form.action">
                    <el-radio label="refresh">刷新</el-radio>
                    <el-radio label="push">预热</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="refreshCDN"
                    :disabled="!isRefresh()"
                    >立即刷新</el-button
                  >
                  <el-button @click="handleClear">清 空</el-button>
                </el-form-item>
              </el-form>
            </div>
          </template>
        </el-dialog>
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      pageSize: 10,
      currentPage: 1,
      q: "",
      total: 0,
      CDNLogList: [],
      dialogVisible: false,
      dialogVisible1: false,
      logData: [],
      form: {
        content: [],
        url: "",
        obj_type: "",
        action: "",
      },
      DomainIDList: [],
      diagnose: 0,
      content: "",
      searchText: "",
    };
  },
  methods: {
    async getCDNLog() {
      let result = await this.$API.cdnList.reqCDNLog(
        this.pageSize,
        this.currentPage,
        this.q
        // this.$store.getters.id
      );
      this.CDNLogList = result.data;
      this.total = result.count;
      console.log(this.CDNLogList);
    },
    showDialog(row) {
      this.dialogVisible = true;
      this.logData = row;
      console.log(row);
    },
    newRefresh() {
      this.dialogVisible1 = true;
      this.getCDNDomainList();
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getCDNLog();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getCDNLog();
    },
    handleCancel() {},
    async refreshCDN() {
      try {
        await this.$API.cdnList.reqRefreshCDN(this.form);
        this.$message({ type: "success", message: "刷新成功" });
        this.dialogVisible1 = false;
      } catch (error) {
        this.$message("刷新失败");
        this.dialogVisible1 = false;
      }
      // await console.log(this.form);
      this.form.url = "";
      this.form.content = [];
      this.form.obj_type = "";
      this.form.action = "";
      this.content = "";
    },
    async getCDNDomainList() {
      let result = await this.$API.cdnList.reqCDNDomainList(this.diagnose);
      this.DomainIDList = result.data;
      console.log(this.DomainIDList);
    },
    handleSelectChange(value) {
      console.log(value);
      console.log(this.form.url);
    },
    handleClear() {
      this.form.url = "";
      this.form.content = [];
      this.form.obj_type = "";
      this.form.action = "";
      this.content = "";
      console.log(this.form);
    },
    handleInput(value) {
      this.form.content = value.split(",");
    },
    isRefresh() {
      if (
        this.form.url &&
        this.form.content &&
        this.form.obj_type &&
        this.form.action
      ) {
        return true;
      }
    },
    handleSearch() {
      this.getCDNLog();
    },
  },
  mounted() {
    this.getCDNLog();
  },
};
</script>

<style scoped>
.line {
  text-align: center;
}
ul {
  padding: 0 0px;
}
.el-header,
.el-footer {
  color: #333;
  text-align: left;
  line-height: 100px;
}
</style>

