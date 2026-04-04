<template>
  <div class="edit-article">
    <el-card class="edit-article-card">
      <template #header>
        <h2>编辑文章</h2>
      </template>
      
      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-else-if="error" class="error">
        <el-alert
          title="加载失败"
          type="error"
          :closable="false"
        >
          {{ error }}
        </el-alert>
        <el-button type="primary" @click="getArticleDetail">重试</el-button>
      </div>
      <el-form v-else :model="articleForm" :rules="rules" ref="articleFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" maxlength="255" show-word-limit />
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="articleForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.name" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in articleForm.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-model="newTag"
            placeholder="请输入标签，按回车添加"
            @keyup.enter="addTag"
            class="tag-input"
          />
        </el-form-item>
        
        <el-form-item label="封面" prop="cover">
          <el-input v-model="articleForm.cover" placeholder="请输入封面图片 URL" />
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入文章内容（Markdown 格式）"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting" style="width: 100%">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { articleAPI, categoryAPI } from '../utils/api'

const route = useRoute()
const router = useRouter()
const articleFormRef = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref(null)
const newTag = ref('')

// 文章表单数据
const articleForm = ref({
  title: '',
  content: '',
  category: '',
  tags: [],
  cover: '',
  author_id: ''
})

// 分类列表
const categories = ref([])

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 255, message: '标题长度必须在 1-255 字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 1, message: '内容不能为空', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ]
}

// 获取文章详情
const getArticleDetail = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id
    const response = await articleAPI.getArticle(id)
    const articleData = response.data
    
    // 处理 tags 字段，将 JSON 字符串转换为数组
    if (articleData.tags) {
      try {
        articleData.tags = JSON.parse(articleData.tags)
      } catch (e) {
        console.error('解析 tags 失败:', e)
        articleData.tags = []
      }
    }
    
    // 填充表单数据
    articleForm.value = {
      title: articleData.title,
      content: articleData.content,
      category: articleData.category,
      tags: articleData.tags || [],
      cover: articleData.cover || '',
      author_id: articleData.author_id
    }
  } catch (err) {
    console.error('获取文章详情失败:', err)
    error.value = '获取文章详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const getCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (err) {
    console.error('获取分类列表失败:', err)
    ElMessage.error('获取分类列表失败，使用默认分类')
    // 设置默认分类选项
    categories.value = [
      { id: 1, name: '技术' },
      { id: 2, name: '生活' },
      { id: 3, name: '感情' }
    ]
  }
}

// 添加标签
const addTag = () => {
  if (newTag.value && !articleForm.value.tags.includes(newTag.value)) {
    articleForm.value.tags.push(newTag.value)
    newTag.value = ''
  }
}

// 删除标签
const removeTag = (tag) => {
  const index = articleForm.value.tags.indexOf(tag)
  if (index > -1) {
    articleForm.value.tags.splice(index, 1)
  }
}

// 提交表单
const submitForm = async () => {
  if (!articleFormRef.value) return
  
  try {
    await articleFormRef.value.validate()
    submitting.value = true
    
    const id = route.params.id
    await articleAPI.updateArticle(id, articleForm.value)
    
    ElMessage.success('文章编辑成功')
    router.push(`/articles/${id}`)
  } catch (err) {
    if (err.response) {
      ElMessage.error(err.response.data.error || '编辑文章失败')
    } else if (err.message) {
      ElMessage.error(err.message)
    } else {
      ElMessage.error('编辑文章失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

// 组件挂载时获取文章详情和分类列表
onMounted(() => {
  getArticleDetail()
  getCategories()
})
</script>

<style scoped>
.edit-article {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-width: 1200px;
}

.edit-article-card {
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.edit-article-card h2 {
  text-align: center;
  margin: 0;
  color: #333;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 18px;
  color: #666;
}

.loading .el-icon {
  margin-right: 10px;
  font-size: 24px;
}

.error {
  margin-top: 20px;
}

.tag-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.tag-input {
  margin-top: 10px;
  width: 100%;
}
</style>
