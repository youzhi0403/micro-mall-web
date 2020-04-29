<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.status" placeholder="请选择上架状态" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="请输入商品名称" style="width: 200px;" class="filter-item" @keyup.enter.native="listPage" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="listPage">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">
        新增
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-download" @click="downloadTemplate">
        导出模板下载
      </el-button>
      <el-upload
        class="import-button"
        :action="excelUploadUrl"
        :on-success="excelUploadSuccess"
        :file-list="excelFileList"
        :show-file-list="excelUploadFileListVisible"
        :headers="tokenHeader"
      >
        <el-button class="filter-item" type="default" size="primary">导入<i class="el-icon-upload el-icon--right" /></el-button>
      </el-upload>

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" align="center" width="80" type="index" />
      <el-table-column label="名称" align="center" prop="name" width="150">
        <template slot-scope="{row}">
          <div class="nowrap-column">{{ row.name }}</div>
        </template>
      </el-table-column>
      <el-table-column label="全称" align="center" prop="fullName" width="150">
        <template slot-scope="{row}">
          <div class="nowrap-column">{{ row.fullName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="160px" align="left">
        <template slot-scope="{row}">
          <div v-if="row.imgs !== null && row.imgs !== ''" class="nowrap-column">
            <img v-for="(item,index) in row.imgs.split(',')" :key="index" :src="item" style="width: 30px;height: 30px;margin-right: 5px;">
          </div>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" prop="price" />
      <el-table-column label="销量" align="center" prop="sales" />
      <el-table-column label="功能主治" align="center" prop="goodFunction" width="300">
        <template slot-scope="{row}">
          <div class="nowrap-column">{{ row.goodFunction }}</div>
        </template>
      </el-table-column>
      <el-table-column label="生产厂家" align="center" prop="manufacturer" width="200" />
      <el-table-column label="商品编号" align="center" prop="goodNumber" />
      <el-table-column label="商品类型" align="center" prop="goodType" />
      <el-table-column label="批准文号" align="center" prop="approvalNumber" />
      <el-table-column label="产品规格" align="center" prop="specification" />
      <el-table-column label="用法用量" align="center" prop="goodUsage" />
      <el-table-column label="通用名称" align="center" prop="commonName" width="150">
        <template slot-scope="{row}">
          <div class="nowrap-column">{{ row.commonName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="不良反应" align="center" prop="untowardEffect" />
      <el-table-column label="禁忌" align="center" prop="taboo" />
      <el-table-column label="库存" align="center" prop="inventory" />
      <el-table-column label="创建时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.createTime !== null">{{ transferTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.updateTime !== null">{{ transferTime(row.updateTime ) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品状态" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag v-if="row.status === 1" type="success">
            正常
          </el-tag>
          <el-tag v-if="row.status === 2" type="warning">
            无货
          </el-tag>
          <el-tag v-if="row.status === 3" type="danger">
            下架
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="330" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdateInventory(row)">
            补充入库
          </el-button>
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click.stop.prevent="del(row)">
            删除
          </el-button>
          <el-button v-if="row.status === 3" type="primary" size="mini" @click.stop.prevent="handleUpdateStatus(row,'up')">
            上架
          </el-button>
          <el-button v-if="row.status === 1" type="danger" size="mini" @click.stop.prevent="handleUpdateStatus(row,'down')">
            下架
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog title="补充库存" :visible.sync="dialogInventoryVisible">
      <el-form ref="inventoryForm" :rules="rulesInventory" :model="tempInventory" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="入库数量" prop="addNum">
          <el-input v-model="tempInventory.addNum" placeholder="请输入入库数量" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogInventoryVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateInventory">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="handleClose">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="220px" style="width: 500px; margin-left:50px;" class="my-form">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品全称" prop="fullName">
          <el-input v-model="temp.fullName" placeholder="请输入商品全称" />
        </el-form-item>
        <el-form-item label="图片" class="my-form-item">
          <el-upload
            ref="my-upload"
            :action="imgUploadUrl"
            list-type="picture-card"
            :on-remove="removeImg"
            :on-success="uploadImg"
            :file-list="fileList"
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择商品状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="请选择商品分类(正常分类)">
          <el-cascader
            v-model="temp.classificationNormalIds"
            :options="classificationNormalTreeList"
            :props="{label:'name',value:'id'}"
            change-on-select
            class="my-cascader"
          />
        </el-form-item>

        <el-form-item label="请选择商品分类(身体部位分类)">
          <el-cascader
            v-model="temp.classificationBodyIds"
            :options="classificationBodyTreeList"
            :props="{label:'name',value:'id'}"
            change-on-select
            class="my-cascader"
          />
        </el-form-item>

        <el-form-item label="请选择商品分类(科室分类)">
          <el-cascader
            v-model="temp.classificationDepartmentIds"
            :options="classificationDepartmentTreeList"
            :props="{label:'name',value:'id'}"
            change-on-select
            class="my-cascader"
          />
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input v-model="temp.price" placeholder="请输入价格" />
        </el-form-item>

        <el-form-item label="功能主治" prop="goodFunction">
          <el-input v-model="temp.goodFunction" placeholder="请输入功能主治" />
        </el-form-item>

        <el-form-item label="生产厂家" prop="manufacturer">
          <el-input v-model="temp.manufacturer" placeholder="请输入生产厂家" />
        </el-form-item>

        <el-form-item label="商品编号" prop="goodNumber">
          <el-input v-model="temp.goodNumber" placeholder="请输入商品编号" />
        </el-form-item>

        <el-form-item label="商品类型" prop="goodType">
          <el-input v-model="temp.goodType" placeholder="请输入商品类型" />
        </el-form-item>

        <el-form-item label="批准文号" prop="approvalNumber">
          <el-input v-model="temp.approvalNumber" placeholder="请输入批准文号" />
        </el-form-item>

        <el-form-item label="产品规格" prop="specification">
          <el-input v-model="temp.specification" placeholder="请输入产品规格" />
        </el-form-item>

        <el-form-item label="用法用量" prop="goodUsage">
          <el-input v-model="temp.goodUsage" placeholder="请输入用法用量" />
        </el-form-item>

        <el-form-item label="通用名称" prop="commonName">
          <el-input v-model="temp.commonName" placeholder="请输入通用名称" />
        </el-form-item>

        <el-form-item label="不良反应" prop="untowardEffect">
          <el-input v-model="temp.untowardEffect" placeholder="请输入不良反应" />
        </el-form-item>

        <el-form-item label="禁忌" prop="taboo">
          <el-input v-model="temp.taboo" placeholder="请输入禁忌" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='add'?add():update()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { add, del, listPage, update, addInventory, detail } from '@/api/good'
import { treeList } from '@/api/classification'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import { getToken } from '@/utils/auth'

export default {
  name: 'Good',
  components: { Pagination },
  data() {
    /* 图片上传url*/
    var imgUploadUrl = process.env.VUE_APP_BASE_API + '/minio/upload'
    /* excel上传url*/
    var excelUploadUrl = process.env.VUE_APP_BASE_API + '/good/import'
    /* excel上传http头部*/
    var tokenHeader = { Authorization: getToken() }
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        keyword: null,
        kind: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑商品',
        add: '新增商品'
      },
      temp: {
        id: undefined,
        name: '',
        fullName: '',
        imgs: '',
        status: '',
        classificationNormalIds: [],
        classificationBodyIds: [],
        classificationDepartmentIds: [],
        classificationList: [],
        price: 0.00,
        goodFunction: '',
        manufacturer: '',
        goodNumber: '',
        goodType: '',
        approvalNumber: '',
        specification: '',
        goodUsage: '',
        commonName: '',
        untowardEffect: '',
        taboo: ''
      },
      classificationNormalTreeList: [],
      classificationBodyTreeList: [],
      classificationDepartmentTreeList: [],
      rules: {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }]
      },
      statusOptions: [
        {
          id: 1,
          label: '正常'
        }, {
          id: 2,
          label: '无货'
        },
        {
          id: 3,
          label: '下架'
        }
      ],
      imgUploadUrl: imgUploadUrl,
      excelUploadUrl: excelUploadUrl,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [],
      dialogInventoryVisible: false,
      rulesInventory: {
        addNum: [{ required: true, message: '请输入入库数量', trigger: 'blur' }]
      },
      tempInventory: {
        addNum: 0
      },
      excelFileList: [],
      excelUploadFileListVisible: false,
      tokenHeader: tokenHeader
    }
  },
  created() {
    this.listPage()
    this.treeNormalList()
    this.treeBodyList()
    this.treeDepartmentList()
  },
  methods: {
    listPage() {
      this.listLoading = true
      listPage(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        fullName: '',
        imgs: '',
        status: '',
        classificationNormalIds: [],
        classificationBodyIds: [],
        classificationDepartmentIds: [],
        classificationList: [],
        price: 0.00,
        goodFunction: '',
        manufacturer: '',
        goodNumber: '',
        goodType: '',
        approvalNumber: '',
        specification: '',
        goodUsage: '',
        commonName: '',
        untowardEffect: '',
        taboo: ''
      }
      this.fileList = []
      this.$refs['my-upload'].clearFiles()
    },
    handleAdd() {
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    add() {
      var arr = []
      for (let i = 0; i < this.fileList.length; i++) {
        arr.push(this.fileList[i].response.data.url)
      }
      this.temp.imgs = arr.join()
      /* 获取分类列表*/
      this.temp.classificationList = []
      for (let i = 0; i < this.temp.classificationBodyIds.length; i++) {
        this.temp.classificationList.push(this.temp.classificationBodyIds[i])
      }
      for (let i = 0; i < this.temp.classificationDepartmentIds.length; i++) {
        this.temp.classificationList.push(this.temp.classificationDepartmentIds[i])
      }
      for (let i = 0; i < this.temp.classificationNormalIds.length; i++) {
        this.temp.classificationList.push(this.temp.classificationNormalIds[i])
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          add(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.listPage()
            this.resetTemp()
          })
        }
      })
    },
    handleUpdate(row) {
      detail(row.id).then(response => {
        this.temp = response.data
        const arr = this.temp.imgs.split(',')
        for (let i = 0; i < arr.length; i++) {
          const name = arr[i].substring(arr[i].lastIndexOf('/'))
          const url = arr[i]
          this.fileList.push({
            name: name,
            uid: url,
            url: url,
            response: {
              code: 200,
              data: {
                name: name,
                url: url
              }
            }
          })
        }

        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    update() {
      /* 获取分类列表*/
      this.temp.classificationList = []
      for (let i = 0; i < this.temp.classificationNormalIds.length; i++) {
        this.temp.classificationList.push(this.temp.classificationNormalIds[i])
      }
      for (let i = 0; i < this.temp.classificationDepartmentIds.length; i++) {
        this.temp.classificationList.push(this.temp.classificationDepartmentIds[i])
      }
      for (let i = 0; i < this.temp.classificationBodyIds.length; i++) {
        this.temp.classificationList.push(this.temp.classificationBodyIds[i])
      }
      /* 获取图片列表*/
      var tempArr = []
      for (let i = 0; i < this.fileList.length; i++) {
        tempArr.push(this.fileList[i].response.data.url)
      }
      this.temp.imgs = tempArr.join(',')

      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          update(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.listPage()
            this.resetTemp()
          })
        }
      })
    },
    del(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        del(row.id).then((res) => {
          this.tip(res)
          this.listPage()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    transferTime(date) {
      return parseTime(new Date(date), '{y}-{m}-{d} {h}:{i}:{s}')
    },
    tip(res) {
      if (res.code === 200) {
        this.$message({
          message: res.message,
          type: 'success'
        })
      } else {
        this.$message.error(res.message)
      }
    },
    removeImg(file, fileList) {
      this.fileList = fileList
    },
    uploadImg(response, file, fileList) {
      this.fileList = fileList
    },
    treeNormalList() {
      treeList(0).then(response => {
        this.classificationNormalTreeList = response.data
      })
    },
    treeBodyList() {
      treeList(1).then(response => {
        this.classificationBodyTreeList = response.data
      })
    },
    treeDepartmentList() {
      treeList(2).then(response => {
        this.classificationDepartmentTreeList = response.data
      })
    },
    handleUpdateInventory(row) {
      this.dialogInventoryVisible = true
      this.tempInventory.id = row.id
    },
    updateInventory() {
      addInventory(this.tempInventory).then(response => {
        this.dialogInventoryVisible = false
        this.$message.success(response.message)
        this.listPage()
      })
    },
    handleUpdateStatus(row, type) {
      const data = {}
      data.id = row.id
      data.name = row.name
      if (type === 'up') {
        data.status = 1
      } else {
        data.status = 3
      }
      update(data).then(response => {
        this.$message.success(response.message)
        this.listPage()
      })
    },
    handleClose(done) {
      this.resetTemp()
      done()
    },
    downloadTemplate() {
      window.location.href = process.env.VUE_APP_BASE_API + '/good/downloadTemplate'
    },
    excelUploadSuccess(response, file, fileList) {
      this.$message.success(response.message)
      this.listPage()
    }
  }
}
</script>

<style lang="scss">
.my-form.el-form{
  width: 600px !important;
}
.my-form-item.el-form-item{
  .el-form-item__content{
    overflow-x: scroll !important;
    white-space: nowrap !important;
  }
}
.nowrap-column{
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.el-cascader{
  vertical-align: middle;
  margin-bottom: 10px;
}
.import-button{
  display: inline-block;
}
</style>
