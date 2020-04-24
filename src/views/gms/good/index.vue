<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.status" placeholder="请选择上架状态" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
      <el-input v-model="listQuery.keyword" placeholder="请输入商品名称" style="width: 200px;" class="filter-item" @keyup.enter.native="listPage" />
      <el-cascader
        v-model="listQuery.classificationId"
        :options="classificationTreeList"
        :props="{label:'name',value:'id'}"
        placeholder="请输入商品分类"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="listPage">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleAdd">
        新增
      </el-button>
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
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="全称" align="center" prop="level" />
      <el-table-column label="图片" width="160px" align="center">
        <template slot-scope="{row}">
          <div v-if="row.imgs !== null && row.imgs !== ''">
            <img v-for="(item,index) in row.imgs.split(',')" :key="index" width="30px" :src="item">
          </div>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" prop="price" />
      <el-table-column label="销量" align="center" prop="sales" />
      <el-table-column label="功能主治" align="center" prop="goodFunction" />
      <el-table-column label="生产厂家" align="center" prop="manufacturer" />
      <el-table-column label="商品编号" align="center" prop="goodNumber" />
      <el-table-column label="商品类型" align="center" prop="goodType" />
      <el-table-column label="批准文号" align="center" prop="approvalNumber" />
      <el-table-column label="产品规格" align="center" prop="specification" />
      <el-table-column label="用法用量" align="center" prop="goodUsage" />
      <el-table-column label="通用名称" align="center" prop="commonName" />
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
          <span v-if="row.status === 1">正常</span>
          <span v-if="row.status === 2">无货</span>
          <span v-if="row.status === 3">下架</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click.stop.prevent="del(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;" class="my-form">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品全称" prop="fullName">
          <el-input v-model="temp.fullName" placeholder="请输入商品全称" />
        </el-form-item>
        <el-form-item label="图片" class="my-form-item">
          <el-upload
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

        <el-form-item label="请选择商品分类">
          <el-cascader
            v-model="temp."
            :options="classificationNormalTreeList"
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

        <el-form-item label="库存" prop="inventory">
          <el-input v-model="temp.inventory" placeholder="请输入库存" />
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
import { add, del, listPage, update } from '@/api/good'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  name: 'Good',
  components: { Pagination },
  data() {
    var imgUploadUrl = process.env.VUE_APP_BASE_API + '/minio/upload'
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
        imgs: ''
      },
      classificationTreeList: [],
      rules: {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }]
      },
      statusOptions: [],
      imgUploadUrl: imgUploadUrl,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: []
    }
  },
  created() {
    this.listPage()
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
        imgs: ''
      }
    },
    handleAdd() {
      this.resetTemp()
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
      console.log(arr)
      this.temp.imgs = arr.join()
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
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    update() {
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
</style>
