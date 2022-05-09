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
          @click="newDiagnose"
          style="display: inline; margin-left: 800px"
          >新建诊断</el-button
        >
      </div>
    </el-header>
    <el-main>
      <div>
        <el-table style="width: 100%" :data="CDNDiagnoseList">
          <el-table-column
            prop="project"
            label="项目"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="domain"
            label="域名"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="url" label="url" width="width" align="center">
          </el-table-column>
          <el-table-column
            prop="create_time"
            label="创建时间"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="diagnose_link"
            label="用户诊断链接"
            width="width"
            align="center"
          >
          </el-table-column>
          <el-table-column width="width" align="center">
            <template slot-scope="{ row }">
              <el-link type="primary" @click="showDialog(row)"
                >诊断详情</el-link
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
          title="详情"
          :visible.sync="dialogVisible"
          @close="handleCancel"
        >
          <template>
            <div v-if="choose === 'one'">
              <el-table
                style="width: 100%"
                :data="diagnoseClient.diagnoseClientLog"
              >
                <el-table-column
                  prop=""
                  label="IP"
                  width="width"
                  align="center"
                >
                  <template slot-scope="{ row }">
                    <!-- <span v-for="(value, key, index) in row.ClientInfo.Data" :key="index">{{value.Value}}</span> -->
                    <span>{{ row.ClientInfo.Data[0].Value }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop=""
                  label="地区"
                  width="width"
                  align="center"
                >
                  <template slot-scope="{ row }">
                    <span>{{ row.ClientInfo.Data[1].Value }}</span>
                    <!-- <span v-for="(Value, key, index) in row" :key="index">{{Value.ProvName}}</span> -->
                  </template>
                </el-table-column>
                <el-table-column
                  prop=""
                  label="执行时间"
                  width="width"
                  align="center"
                >
                  <template slot-scope="{ row }">
                    <span>{{ row.BaskInfo.Data[2].Value }}</span>
                    <!-- <span v-for="(Value, key, index) in row" :key="index">{{Value.ProvName}}</span> -->
                  </template>
                </el-table-column>
                <el-table-column width="width" align="center">
                  <template slot-scope="{ row }">
                    <el-link type="primary" @click="handleDetailInfo(row)"
                      >详情</el-link
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div v-if="choose === 'two'">
              <el-scrollbar
                style="height: 500px"
                wrap-class="default-scrollbar__wrap"
              >
                <pre> {{ detailInfo }}</pre>
              </el-scrollbar>
            </div>
            <span slot="footer" class="dialog-footer" v-if="choose === 'two'">
              <el-button @click="handleBack">返 回</el-button>
            </span>
          </template>
        </el-dialog>
        <el-dialog
          title="新建诊断"
          :visible.sync="dialogVisible1"
          @close="handleCancel"
        >
          <template>
            <el-form ref="form" :model="form" label-width="80px">
              <el-form-item label="域名:">
                <el-select
                  v-model="form.url"
                  placeholder="请选择DomainID"
                  @change="handleSelectChange"
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
              <el-form-item label="诊断内容:">
                <el-input
                  v-model="form.content"
                  placeholder="请输入刷新或预热地址（注意格式应为'/'开头 不同内容之间用','隔开 例如：/,/test）"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  @click="createDiagnose"
                  :disabled="!isCreate()"
                  >立即诊断</el-button
                >
                <el-button @click="handleClear">清 空</el-button>
              </el-form-item>
            </el-form>
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
      CDNDiagnoseList: [],
      dialogVisible: false,
      dialogVisible1: false,
      diagnoseClient: {
        diagnoseClientInfo: [],
        diagnoseClientLog: [],
      },
      form: {
        content: "",
        url: "",
      },
      DomainIDList: [],
      content: "",
      diagnose: 1,
      choose: "",
      detailInfo: {},
    };
  },
  methods: {
    async getCDNDiagnoseList() {
      let result = await this.$API.cdnList.reqCDNDiagnoseList(
        this.pageSize,
        this.currentPage,
        this.q
      );
      this.CDNDiagnoseList = result.data;
      this.total = result.count;
      console.log(this.CDNDiagnoseList);
    },
    async getCDNDomainList() {
      let result = await this.$API.cdnList.reqCDNDomainList(this.diagnose);
      this.DomainIDList = result.data;
      console.log(this.DomainIDList);
    },
    showDialog(row) {
      this.dialogVisible = true;
      this.diagnoseClient.diagnoseClientInfo = row.client_info;
      this.diagnoseClient.diagnoseClientLog = row.client_log;
      this.choose = "one";
      console.log(this.diagnoseClient.diagnoseClientLog);
    },
    newDiagnose() {
      this.dialogVisible1 = true;
      this.getCDNDomainList();
    },
    async createDiagnose() {
      try {
        await this.$API.cdnList.reqCreateDiagnose(this.form);
        this.$message({ type: "success", message: "提交成功" });
        this.dialogVisible1 = false;
      } catch (error) {
        this.$message("提交失败");
        this.dialogVisible1 = false;
      }
      // await console.log(this.form);
      this.form.url = "";
      this.form.content = [];
      this.content = "";
    },
    isCreate() {
      if (this.form.url && this.form.content) {
        return true;
      }
    },
    handleSelectChange(value) {
      console.log(value);
      console.log(this.form.url);
    },
    handleDetailInfo(row) {
      this.choose = "two";
      this.detailInfo = JSON.stringify(row, null, 4);
    },
    handleBack() {
      this.choose = "one";
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getCDNDiagnoseList();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getCDNDiagnoseList();
    },
    handleSearch() {
      this.getCDNDiagnoseList();
      console.log(this.$store.getters.id);
    },
    handleClear() {
      this.form.url = "";
      this.form.content = [];
      this.content = "";
    },
    handleCancel() {},
  },
  mounted() {
    this.getCDNDiagnoseList();
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
.default-scrollbar__wrap {
  overflow-x: hidden;
}
.el-header,
.el-footer {
  color: #333;
  text-align: left;
  line-height: 100px;
}
</style>

