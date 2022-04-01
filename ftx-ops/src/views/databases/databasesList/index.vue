<template>
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

    <el-dialog title="提示" :visible.sync="dialogVisible">
      <template>
        <div class="block" v-if="choose === 'one'">
          <span class="demonstration">请确定回档时间</span>
          <el-date-picker
            v-model="rollbackTime"
            type="datetime"
            placeholder="选择日期时间"
            :picker-options="pickerOptions"
            style="margin-bottom: 20px; text-align: end"
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
          <span v-if="isShow === '普通'"
            >导入该实例的全量备份，再在对选中的库、表进行回档。该回档模式无限制，但回档速度较慢。</span
          >
          <span v-if="isShow === '快速'" style="color: red"
            >注意：仅导入所选中库级别的备份和binlog，如有跨库操作，且关联库未被同时选中，将会导致回档失败。</span
          >
          <span v-if="isShow === '极速'" style="color: red"
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
              <el-table-column prop="name" label="已选表" width="width">
              </el-table-column>
              <el-table-column prop="name_bak" label="回档后表名" width="width">
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
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </span>
      <span slot="footer" class="dialog-footer" v-if="choose === 'two'">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
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
      choose: "",
      isShow: "普通",
      dataTree: [],
      databaseAndTable: [],
      databaseName: [],
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
      strategy: "",
      rollbackList: [],
      instanceId: "",
    };
  },
  methods: {
    async getDatabasesList() {
      let result = await this.$API.databasesList.reqDatabasesInstance(
        this.limit,
        this.currentPage
      );
      this.instanceList = result.data;
      this.total = result.count;
      // console.log(result);
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
      this.isShow = "";
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
    nextStep() {
      this.choose = "two";
      this.databaseAndTable.forEach((list) => {
        list.name_bak = list.name + "_bak";
      });
      console.log(this.databaseAndTable);
      console.log(this.strategy);
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
            if (!this.databaseAndTable.name) {
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
      this.strategy = "";
      this.dataTree = [];
      this.beginDate = "";
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
};
</script>

<style>
.default-scrollbar__wrap {
  overflow-x: hidden;
}
</style>