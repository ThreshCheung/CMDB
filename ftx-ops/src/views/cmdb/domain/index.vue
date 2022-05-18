<template>
  <el-container>
    <el-row :gutter="10">
      <el-col :span="3">
        <el-header>
          <el-input
            placeholder=""
            style="text-align: left; width: 60%"
            size="mini"
          ></el-input>
          <el-button
            type="primary"
            size="mini"
            style="display: inline; margin-left: 5px"
            >搜索</el-button
          >
        </el-header>
        <el-main>
          <div>
            <el-scrollbar
              style="height: 600px"
              wrap-class="default-scrollbar__wrap"
            >
              <el-table
                :data="domainList"
                style="width: 100%"
                border
                height="600"
              >
                <el-table-column prop="" label="域名" width="width">
                  <template slot-scope="{ row }">
                    <el-link type="primary" @click="setId(row)">
                      {{ row.name }}
                    </el-link>
                  </template>
                </el-table-column>
              </el-table>
            </el-scrollbar>
          </div>
        </el-main>
      </el-col>
      <el-col :span="21">
        <el-header>
          <div class="header">
            <span style="display: inline; margin-right: 10px">主机记录</span
            ><el-input
              placeholder=""
              style="text-align: left; width: 15%"
              v-model="rr"
            ></el-input>
            <span style="display: inline; margin: 10px">记录值</span
            ><el-input
              placeholder=""
              style="text-align: left; width: 15%"
              v-model="value"
            ></el-input>
            <el-button
              type="primary"
              style="display: inline; margin-left: 20px"
              @click="handleSearch"
              >查询</el-button
            >
            <el-button
              style="display: inline; margin-left: 20px"
              @click="handleReset"
              icon="el-icon-refresh"
              >重置</el-button
            >
            <el-button
              icon="el-icon-refresh"
              circle
              style="display: inline; margin-left: 500px"
              size="small "
              @click="handleRefresh"
            ></el-button>
            <el-button
              type="primary"
              style="display: inline; margin-left: 10px"
              @click="isShow"
              >添加记录</el-button
            >
            <!-- <el-button
              type="primary"
              style="display: inline; margin-left: 10px"
              @click="handleBack"
              >返回</el-button
            > -->
          </div>
        </el-header>
        <el-main>
          <div>
            <el-table :data="recordList" style="width: 100%" border @sort-change="sortChange">
              <el-table-column prop="rr" label="主机记录">
                <template slot-scope="scope">
                  <el-input
                    v-if="scope.row.edit"
                    v-model="scope.row.rr"
                    placeholder=""
                  ></el-input>
                  <span v-else>{{ scope.row.rr }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="tp" label="记录类型">
                <template slot-scope="scope">
                  <el-select
                    v-model="scope.row.tp"
                    placeholder="请选择"
                    v-if="scope.row.edit"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  <span v-else>{{ scope.row.tp }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="记录值">
                <template slot-scope="scope">
                  <el-input
                    v-if="scope.row.edit"
                    v-model="scope.row.value"
                  ></el-input>
                  <span v-else>{{ scope.row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="update_time" sortable label="最后操作时间">
              </el-table-column>
              <el-table-column prop="user.username" label="操作人">
              </el-table-column>
              <el-table-column prop="" label="操作">
                <template slot-scope="scope">
                  <div v-if="scope.row.edit">
                    <el-button type="primary" @click="handleSave(scope.row)"
                      >保存</el-button
                    >
                    <el-button type="danger" @click="handleCancel(scope.row)"
                      >取消</el-button
                    >
                  </div>
                  <div v-else>
                    <el-button type="warning" @click="handleEdit(scope.row)"
                      >编辑</el-button
                    >
                    <el-popconfirm
                      title="确定删除这条记录吗？"
                      @onConfirm="handleConfirm(scope.row)"
                      @onCancel="onCancel()"
                    >
                      <el-button
                        slot="reference"
                        type="danger"
                        style="display: inline; margin-left: 10px"
                        >删除</el-button
                      >
                    </el-popconfirm>
                  </div>
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
              title="添加记录"
              :visible.sync="dialogVisible"
              width="width"
              :before-close="dialogBeforeClose"
            >
            <h1>{{urlName}}</h1>
              <el-form :model="form">
                <el-form-item label="主机记录">
                  <el-input
                    v-model="form.rr"
                    style="text-align: left; width: 40%"
                    placeholder="请输入主机记录，例如“@”"
                  ></el-input>
                </el-form-item>
                <el-form-item label="记录类型">
                  <el-select v-model="form.tp" placeholder="请选择">
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="记录值　">
                  <el-input
                    v-model="form.value"
                    style="text-align: left; width: 40%"
                    placeholder="请输入记录值"
                  ></el-input>
                </el-form-item>
              </el-form>
              <div slot="footer">
                <el-button @click="dialogBeforeClose">取 消</el-button>
                <el-button type="primary" @click="addRecord">确 定</el-button>
              </div>
            </el-dialog>
          </div>
        </el-main>
      </el-col>
    </el-row>
    <el-footer> </el-footer>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      rr: "",
      value: "",
      total: 0,
      domainId: 0,
      id: 0,
      domainList: [],
      recordList: [],
      choose: 1,
      isEdit: false,
      options: [
        { value: "A", label: "A" },
        { value: "AAAA", label: "AAAA" },
        { value: "CNAME", label: "CNAME" },
      ],
      editRecordObj: {
        id: "",
        rr: "",
        tp: "",
        value: "",
      },
      confirmRecord: {
        id: "",
      },
      dialogVisible: false,
      urlName:'',
      form: {
        domainId: "",
        rr: "",
        tp: "",
        value: "",
      },
    };
  },
  methods: {
    async getDomainList() {
      const result = await this.$API.domainList.reqDomainList();
      this.domainList = result.data;
      console.log(this.domainList);
    },
    async getRecordList() {
      const result = await this.$API.domainList.reqRecordList(
        this.currentPage,
        this.pageSize,
        this.domainId,
        this.rr,
        this.value
      );
      this.recordList = result.data.records;
      this.choose = 2;
      this.total = result.data.total;
      console.log(this.recordList);
      console.log(result);
    },
    async editRecord() {
      await this.$API.domainList.reqEditRecord(this.editRecordObj);
    },
    async addRecord() {
      this.form.domainId = this.domainId;
      await this.$API.domainList.reqAddRecord(this.form);
      this.dialogVisible = false;
      this.getRecordList();
    },
    async onConfirm(){
      await this.$API.domainList.reqDeleteRecord(this.confirmRecord)
      this.getRecordList();
    },
    isShow() {
      this.dialogVisible = true;
    },
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getRecordList();
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.getRecordList();
    },
    setId(value) {
      this.domainId = value.id;
      this.urlName = value.name
      this.getRecordList();
    },
    handleSearch() {
      this.currentPage = 1;
      this.pageSize = 10;
      this.getRecordList();
    },
    // handleBack() {
    //   this.choose = 1;
    //   this.rr = "";
    //   this.value = "";
    // },
    handleReset() {
      this.rr = "";
      this.value = "";
      this.getRecordList();
    },
    handleEdit(row) {
      row.edit = true;
    },
    handleSave(row) {
      console.log(row);
      console.log(this.domainId);
      row.edit = false;
      this.editRecordObj.id = row.id;
      this.editRecordObj.rr = row.rr;
      this.editRecordObj.tp = row.tp;
      this.editRecordObj.value = row.value;
      console.log(this.editRecordObj);
      this.editRecord();
    },
    handleRefresh() {
      this.currentPage = 1;
      this.getRecordList();
    },
    handleCancel(row) {
      row.edit = false;
    },
    dialogBeforeClose() {
      this.form.id = "";
      this.form.rr = "";
      this.form.tp = "";
      this.form.value = "";
      this.dialogVisible = false;
    },
    handleConfirm(row) {
      this.confirmRecord.id = row.id;
      this.onConfirm()
    },
    onCancel() {
      console.log("!");
    },
    // compare (propertyName, sort) {
    //   return function (obj1, obj2) {
    //     var value1 = obj1[propertyName]
    //     var value2 = obj2[propertyName]
    //     if (typeof value1 === 'string' && typeof value2 === 'string') {
    //       const res = value1.localeCompare(value2, 'zh')
    //       return sort === 'ascending' ? res : -res
    //     } else {
    //       if (value1 <= value2) {
    //         return sort === 'ascending' ? -1 : 1
    //       } else if (value1 > value2) {
    //         return sort === 'ascending' ? 1 : -1
    //       }
    //     }
    //   }
    // },
    // sortChange( {prop, order} ) {
    //   console.log(prop);
    //   console.log(order);
    //   this.recordList.sort(this.compare(prop,order));
    //   console.log("@");
    // },
  },
  mounted() {
    this.getDomainList();
  },
};
</script>

<style>
.el-header,
.header,
.el-footer {
  color: #333;
  text-align: left;
  line-height: 100px;
}
.default-scrollbar__wrap {
  overflow-x: hidden;
}
</style>