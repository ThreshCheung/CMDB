<template>
  <el-container>
    <el-header>
      <div>
        <el-input
          type="captcha"
          placeholder="搜索"
          style="text-align: left; width: 40%"
          v-model="q1"
        >
        </el-input
        ><el-button
          type="primary"
          style="display: inline; margin-left: 20px"
          @click="handleSearch"
          >搜索</el-button
        >
      </div>
    </el-header>
    <el-main>
      <div>
        <el-table style="width: 100%" border :data="instanceList">
          <el-table-column prop="id" label="序号" width="80%" align="center">
          </el-table-column>
          <el-table-column prop="hostname" label="数据库名称" width="width">
          </el-table-column>
          <el-table-column prop="create_at" label="CreateTime" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="showDialog(row)"
                >回档</el-button
              >
              <el-button type="danger" icon="el-icon-delete" size="mini"
                >删除</el-button
              >
              <el-button
                type="primary"
                icon="el-icon-search"
                size="mini"
                @click="showDialog1(row)"
                >慢查询</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="margin-top: 20px; text-align: center"
          :current-page="currentPage"
          :page-sizes="[10, 15, 20]"
          :page-size="limit"
          layout=" prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        >
        </el-pagination>

        <el-dialog
          title="提示"
          :visible.sync="dialogVisible"
          @close="handleCancel"
        >
          <template>
            <div class="block" v-if="choose === 'one'">
              <span class="demonstration">请确定回档时间</span>
              <el-date-picker
                v-model="rollbackTime"
                type="datetime"
                placeholder="选择日期时间"
                :picker-options="pickerOptions"
                style="margin-bottom: 20px; text-align: end"
                value-format="yyyy-MM-dd HH:mm:ss"
                @blur="timeShow"
              >
              </el-date-picker>
              <br />
              <el-radio-group v-model="radio1" @change="speedStrategy">
                <el-radio-button label="普通"></el-radio-button>
                <el-radio-button label="快速"></el-radio-button>
                <el-radio-button label="极速"></el-radio-button>
              </el-radio-group>
              <br />
              <span v-show="isShow === '普通'"
                >导入该实例的全量备份，再在对选中的库、表进行回档。该回档模式无限制，但回档速度较慢。</span
              >
              <span v-show="isShow === '快速'" style="color: red"
                >注意：仅导入所选中库级别的备份和binlog，如有跨库操作，且关联库未被同时选中，将会导致回档失败。</span
              >
              <span v-show="isShow === '极速'" style="color: red"
                >注意：仅导入所选中表级别的备份和binlog，如有跨表操作，且关联表未被同时选中，将会导致回档失败。
                极速模式下，请手动选择需要回档的表</span
              >
              <el-input
                placeholder="输入关键字进行过滤"
                v-model="filterText"
                clearable
                maxlength="2000"
              >
              </el-input>
              <el-scrollbar
                style="height: 300px"
                wrap-class="default-scrollbar__wrap"
              >
                <el-tree
                  class="filter-tree"
                  :props="defaultProps"
                  :load="loadNode"
                  lazy
                  :filter-node-method="filterNode"
                  ref="tree"
                  show-checkbox
                  @check="selectNode"
                  @node-click="handleNodeClick"
                  node-key="id"
                  @node-expand="handleNodeExpand"
                  check-on-click-node
                >
                </el-tree>
              </el-scrollbar>
            </div>
            <div v-if="choose === 'two'">
              <el-scrollbar
                style="height: 300px"
                wrap-class="default-scrollbar__wrap"
              >
                <el-table :data="databaseAndTable" style="width: 100%">
                  <el-table-column prop="fatherName" label="库名" width="width">
                  </el-table-column>
                  <el-table-column prop="name" label="已选表" width="width">
                  </el-table-column>
                  <el-table-column
                    prop="name_bak"
                    label="回档后表名"
                    width="width"
                  >
                    <template slot-scope="{ row }">
                      <el-input v-model="row.name_bak" />
                    </template>
                  </el-table-column>
                </el-table>
              </el-scrollbar>
            </div>
          </template>
          <span slot="footer" class="dialog-footer" v-if="choose === 'one'">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button
              type="primary"
              @click="nextStep"
              :disabled="!rollbackTime"
              >下一步</el-button
            >
          </span>
          <span slot="footer" class="dialog-footer" v-if="choose === 'two'">
            <el-button type="primary" @click="handleBack">上一步</el-button>
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" @click="handleRollback">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="慢查询"
          :visible.sync="dialogVisible1"
          width="60%"
          @close="handleClose"
        >
          <div class="block">
            <el-date-picker
              v-model="value1"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
            <el-input
              v-model="q"
              placeholder="请输入要查询的SQL语句关键字"
              style="text-align: left; width: 30%; margin-left: 20px"
            ></el-input>
            <el-button
              type="primary"
              style="display: inline; margin-left: 20px"
              @click="handleQuery"
              >查询</el-button
            >
            <el-table :data="slowLogList" style="width: 100%" height="500">
              <el-table-column prop="timestamp" label="执行时间" width="width">
              </el-table-column>
              <el-table-column prop="" label="SQL语句" width="width">
                <template slot-scope="scope">
                  <el-tooltip
                    class="item"
                    effect="dark"
                    :content="scope.row.sql_text"
                    placement="top"
                  >
                    <span
                      style="
                        width: 120px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      "
                      >{{ scope.row.sql_text }}</span
                    >
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column
                prop="user_host"
                label="客户端地址"
                width="width"
              >
              </el-table-column>
              <el-table-column prop="user_name" label="用户名" width="width">
              </el-table-column>
              <el-table-column prop="database" label="数据库名" width="width">
              </el-table-column>
              <el-table-column
                prop="query_time"
                label="执行时长(秒)"
                width="width"
              >
              </el-table-column>
            </el-table>
          </div>
          <!-- <div slot="footer">
        <el-button @click="handleCancel1">取 消</el-button>
        <el-button type="primary" @click="dialogVisible1 = false"
          >确 定</el-button
        >
      </div> -->
        </el-dialog>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "databasesList",
  data() {
    return {
      currentPage: 1,
      instanceList: [],
      tableList: [],
      instance_id: "",
      limit: 10,
      total: 0,
      dialogVisible: false,
      dialogVisible1: false,
      choose: "",
      isShow: "普通",
      dataTree: [],
      databaseAndTable: [],
      beginDate: "",
      defaultProps: {
        label: "name",
        children: "table",
        isLeaf: "leaf",
      },
      filterText: "",
      pickerOptions: {},
      radio1: "普通",
      rollbackTime: "",
      strategy: "full",
      disabledNext: false,
      rollbackList: [],
      rollbackInfo: {
        instanceId: "",
        strategy: "",
        rollbackTime: "",
        rollbackList: {},
      },
      value1: [],
      start_time: "",
      stop_time: "",
      slowLogList: [],
      q: "",
      q1: "",
    };
  },
  methods: {
    async getDatabasesList() {
      let result = await this.$API.databasesList.reqDatabasesInstance(
        this.limit,
        this.currentPage,
        this.$store.getters.id,
        this.q1
      );
      this.instanceList = result.data;
      this.total = result.count;
      console.log(result);
    },
    async getSlowLogList() {
      console.log(this.value1);
      this.start_time = this.value1[0];
      this.stop_time = this.value1[1];
      console.log(this.start_time, this.stop_time);
      let result = await this.$API.databasesList.reqSlowLogList(
        this.instance_id,
        this.start_time,
        this.stop_time,
        this.q
      );
      this.slowLogList = result.data;
      console.log(result);
    },
    handleQuery() {
      console.log(this.q);
      this.getSlowLogList();
    },
    handleSizeChange(limit) {
      this.limit = limit;
      this.getDatabasesList();
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getDatabasesList();
    },
    async showDialog(row) {
      let result = await this.$API.databasesList.reqDatabasesList(
        row.instance_id
      );
      this.instance_id = row.instance_id;
      this.isShow = "普通";
      this.dialogVisible = true;
      this.choose = "one";
      this.dataTree = result.data;
      console.log(this.dataTree);
      this.beginDate = row.rollback_begin;
      this.filterText = "";
      this.pickerOptions = {
        disabledDate: (time) => {
          return (
            time.getTime() > Date.now() ||
            time.getTime() < this.beginDateNodeDays
          );
        },
      };
    },
    showDialog1(row) {
      this.dialogVisible1 = true;
      console.log(row);
      this.instance_id = row.instance_id;
      this.getSlowLogList();
    },
    nextStep() {
      this.choose = "two";
      this.databaseAndTable.forEach((list) => {
        list.name_bak = list.name + "_bak";
      });
      this.rollbackInfo.instanceId = this.instance_id;
      this.rollbackInfo.strategy = this.strategy;
      this.rollbackInfo.rollbackTime = this.rollbackTime;
      this.rollbackInfo.rollbackList = this.databaseAndTable;
      // console.log(this.databaseAndTable);
      // console.log(this.strategy);
      console.log(this.rollbackInfo);
    },
    handleBack() {
      this.choose = "one";
      this.databaseAndTable = [];
      this.rollbackTime = "";
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    selectNode(data, obj) {
      this.databaseAndTable = obj.checkedNodes;
    },
    handleNodeClick(data, node) {
      setTimeout(() => {
        if (node.level > 1 && node.checked === true) {
          this.databaseAndTable.forEach((list) => {
            if (!list.fatherName) {
              list.fatherName = node.parent.data.name;
            }
          });
          console.log(this.databaseAndTable);
          console.log(node.checked);
        }
      }, 1000);
    },
    async handleNodeExpand(obj, node, self) {
      if (node.level === 1) {
        let result = await this.$API.databasesList.reqTables(
          this.instance_id,
          obj.name
        );
        this.tableList = result.data;
        // console.log(self);
        // console.log(this.instance_id);
      }
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(this.dataTree);
      }
      if (node.level > 1) return resolve([]);

      setTimeout(() => {
        const data = this.tableList;
        resolve(data);
      }, 500);
    },
    speedStrategy(value) {
      this.isShow = value;
      if (value == "普通") {
        this.strategy = "full";
      } else if (value == "快速") {
        this.strategy = "db";
      } else {
        this.strategy = "table";
      }
      console.log(this.strategy);
    },
    timeShow() {
      console.log(this.rollbackTime);
    },
    handleCancel() {
      this.dialogVisible = false;
      this.tableList = [];
      this.instance_id = "";
      this.choose = "";
      this.rollbackTime = "";
      this.strategy = "full";
      this.dataTree = [];
      this.beginDate = "";
      this.radio1 = "普通";
    },
    async handleRollback() {
      await this.$API.databasesList.reqRollback(this.rollbackInfo);
      this.dialogVisible = false;
      this.tableList = [];
      this.instance_id = "";
      this.choose = "";
      this.rollbackTime = "";
      this.strategy = "full";
      this.dataTree = [];
      this.beginDate = "";
      this.radio1 = "普通";
    },
    handleClose() {
      this.q = " ";
    },
    handleSearch() {
      this.getDatabasesList();
    },
  },
  computed: {
    beginDateNodeDays: {
      get: function () {
        let curDate = new Date().getTime();
        let beginDateNode = Date.parse(new Date(this.beginDate));
        let gapDate = curDate - beginDateNode;
        return curDate - gapDate;
      },
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  mounted() {
    this.getDatabasesList();
  },
  created() {
    //当前设定的日期时间
    let d = new Date();
    let year1, month1, day1, hour1, minutes1, seconds1;
    [year1, month1, day1, hour1, minutes1, seconds1] = [
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ];
    month1 = month1 < 10 ? "0" + month1 : month1;
    day1 = day1 < 10 ? "0" + day1 : day1;
    hour1 = hour1 < 10 ? "0" + hour1 : hour1;
    minutes1 = minutes1 < 10 ? "0" + minutes1 : minutes1;
    seconds1 = seconds1 < 10 ? "0" + seconds1 : seconds1;
    var date1 =
      year1 +
      "-" +
      (Number(month1) + 1) +
      "-" +
      day1 +
      " " +
      hour1 +
      ":" +
      minutes1 +
      ":" +
      seconds1;
    this.value1.push(date1);
    //前一天设定的日期时间
    let year2, month2, day2, hour2, minutes2, seconds2;
    d.setTime(d.getTime() - 24 * 60 * 60 * 1000);
    [year2, month2, day2, hour2, minutes2, seconds2] = [
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ];
    month2 = month2 < 10 ? "0" + month2 : month2;
    day2 = day2 < 10 ? "0" + day2 : day2;
    hour2 = hour2 < 10 ? "0" + hour2 : hour2;
    minutes2 = minutes2 < 10 ? "0" + minutes2 : minutes2;
    seconds2 = seconds2 < 10 ? "0" + seconds2 : seconds2;
    var date2 =
      year2 +
      "-" +
      (Number(month2) + 1) +
      "-" +
      day2 +
      " " +
      hour2 +
      ":" +
      minutes2 +
      ":" +
      seconds2;
    this.value1.unshift(date2);
  },
};
</script>

<style>
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