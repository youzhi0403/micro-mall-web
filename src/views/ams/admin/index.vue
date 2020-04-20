<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="昵称" align="center" prop="nickname" />
      <el-table-column label="邮箱" align="center" prop="email" width="260px" />
      <el-table-column label="备注" align="center" prop="note" />
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
      <el-table-column label="上次登录时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.loginTime !== null">{{ transferTime(row.loginTime) }}</span>
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
      <el-table-column label="操作" align="center" width="330" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click.stop.prevent="handleUpdateRole(row)">
            设置角色
          </el-button>
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
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNum" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="170px" style="width: 400px; margin-left:50px;">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="账号" prop="username">
          <el-input v-model="temp.username" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" type="password" autocomplete="off" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="temp.checkPass" type="password" autocomplete="off" placeholder="请再次输入密码" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="备注" prop="note">
          <el-input v-model="temp.note" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="设置管理员角色" :visible.sync="dialogRoleVisible">
      <el-form ref="roleForm" label-position="left" label-width="170px" style="width: 400px; margin-left:50px;">
        <el-form-item label="角色设置">
          <el-select
            v-model="tempRoles.roleIds"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择角色"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRoleVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="setRoles">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, createAdmin, updateAdmin, del, forbidden, launch, getRoles, setRoles } from '@/api/admin'
import { getList } from '@/api/role'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
export default {
  name: 'Admin',
  components: { Pagination },
  data() {
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
      } else if (value !== this.temp.password) {
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
        pageSize: 20
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑管理员',
        create: '创建管理员'
      },
      temp: {
        id: undefined,
        nickname: '',
        username: '',
        password: '',
        checkPass: '',
        email: '',
        note: ''
      },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }],
        checkPass: [{ required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      },
      dialogRoleVisible: false,
      tempRoles: {
        adminId: undefined,
        roleIds: []
      },
      roleOptions: []
    }
  },
  created() {
    this.getList()
    this.getRoleOptions()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getRoleOptions() {
      getList().then(response => {
        this.roleOptions = response.data
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        nickname: '',
        username: '',
        password: '',
        checkPass: '',
        email: '',
        note: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createAdmin(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.checkPass = row.password
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdateRole: function(row) {
      this.dialogRoleVisible = true
      this.tempRoles.adminId = row.id
      getRoles(row.id).then(response => {
        this.roleIds = []
        for (const temp in response.data) {
          this.roleIds.push(temp.id)
        }
      })
    },
    handleModifyStatus(row, status) {
      if (status === 'start') {
        /* 启用*/
        launch(row.id).then((res) => {
          this.tip(res)
          this.getList()
        })
      }
      if (status === 'forbidden') {
        /* 禁用*/
        forbidden(row.id).then((res) => {
          this.tip(res)
          this.getList()
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
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    setRoles() {
      setRoles(this.tempRoles).then(response => {
        this.$message.success(response.message)
        this.dialogRoleVisible = false
        this.getList()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateAdmin(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
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
    }
  }

}
</script>

<style scoped>

</style>
