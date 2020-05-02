<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.account" placeholder="请输入用户账号" style="width: 200px;" class="filter-item" @keyup.enter.native="listPage" />
      <el-input v-model="listQuery.telephone" placeholder="请输入手机号码" style="width: 200px;" class="filter-item" @keyup.enter.native="listPage" />
      <el-input v-model="listQuery.nickname" placeholder="清输入用户昵称" style="width: 200px;" class="filter-item" @keyup.enter.native="listPage" />
      <el-select v-model="listQuery.deleteStatus" placeholder="请选择是否禁用" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in deleteStatusOptions" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
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
      <el-table-column label="用户昵称" align="center" prop="nickname" />
      <el-table-column label="手机号" align="center" prop="telephone" />
      <el-table-column label="账号" align="center" prop="account" />
      <el-table-column label="余额" align="center" prop="balance" />
      <el-table-column label="用户头像" align="center" prop="avatar">
        <template slot-scope="{row}">
          <img :src="row.avatar" style="width: 30px;height: 30px;margin-right: 5px;">
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.createTime !== null">{{ transferTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120px" align="center">
        <template slot-scope="{row}">
          <span>
            <el-tag v-if="row.status === 0" type="success">启用</el-tag>
            <el-tag v-if="row.status === 1" type="danger">禁用</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status == 1" size="mini" type="success" @click="handleModifyStatus(row,'start')">
            启用
          </el-button>
          <el-button v-if="row.status == 0" size="mini" @click="handleModifyStatus(row,'forbidden')">
            禁用
          </el-button>
          <el-button size="mini" type="danger" @click.stop.prevent="handleModifyStatus(row,'delete')">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="listPage" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="handleClose">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="账号" prop="account">
          <el-input v-model="temp.account" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="账号" prop="avatar">
          <el-upload
            ref="avatar-uploader"
            class="avatar-uploader"
            :action="imgUploadUrl"
            :on-remove="removeImg"
            :on-success="uploadImg"
            :show-file-list="false"
            :file-list="fileList"
          >
            <img v-if="temp.avatar" :src="temp.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>

        <el-form-item label="密码" prop="loginPassword">
          <el-input v-model="temp.loginPassword" type="password" autocomplete="off" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="temp.checkPass" type="password" autocomplete="off" placeholder="请再次输入密码" />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="手机号码" prop="telephone">
          <el-input v-model="temp.telephone" placeholder="请输入手机号码" />
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
import { listPage, add, update, del, forbidden, launch } from '@/api/user'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  name: 'User',
  components: { Pagination },
  data() {
    /* 图片上传url*/
    var imgUploadUrl = process.env.VUE_APP_BASE_API + '/minio/upload'
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.temp.checkPass !== '') {
          this.$refs.dataForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.temp.loginPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      tableKey: 0,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        account: '',
        telephone: '',
        nickname: '',
        deleteStatus: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑用户',
        add: '创建用户'
      },
      temp: {
        id: undefined,
        account: '',
        avatar: '',
        loginPassword: '',
        checkPass: '',
        nickname: '',
        telephone: ''
      },
      rules: {
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        loginPassword: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }],
        checkPass: [{ required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }]
      },
      deleteStatusOptions: [
        {
          id: '',
          label: '全部'
        },
        {
          id: '1',
          label: '启用'
        },
        {
          id: '0',
          label: '禁用'
        }
      ],
      imgUploadUrl: imgUploadUrl,
      /* 头像图片*/
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
        account: '',
        avatar: '',
        loginPassword: '',
        checkPass: '',
        nickname: '',
        telephone: ''
      }
      this.fileList = []
      this.$refs['avatar-uploader'].clearFiles()
    },
    handleAdd() {
      this.dialogStatus = 'add'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    add() {
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
      this.temp = Object.assign({}, row) // copy obj
      this.temp.checkPass = row.loginPassword
      const name = this.temp.avatar.substring(this.temp.avatar.lastIndexOf('/'))
      const url = this.temp.avatar
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
            this.resetTemp()
          })
        }
      })
    },
    handleClose(done) {
      this.resetTemp()
      done()
    },
    handleModifyStatus(row, status) {
      if (status === 'start') {
        /* 启用*/
        launch(row.id).then((res) => {
          this.tip(res)
          this.listPage()
        })
      }
      if (status === 'forbidden') {
        /* 禁用*/
        forbidden(row.id).then((res) => {
          this.tip(res)
          this.listPage()
        })
      }
      if (status === 'delete') {
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
      }
    },
    removeImg(file, fileList) {
      this.fileList = fileList
      this.temp.avatar = null
    },
    uploadImg(response, file, fileList) {
      this.fileList = fileList
      this.temp.avatar = response.data.url
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
    }
  }
}
</script>

<style lang="scss">
.avatar-uploader{
  .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
}
.avatar-uploader{
  .el-upload:hover {
    border-color: #409EFF;
  }
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 88px;
  height: 88px;
  line-height: 88px;
  text-align: center;
}
.avatar {
  width: 88px;
  height: 88px;
  display: block;
}

</style>
