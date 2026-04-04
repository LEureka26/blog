<template>
  <div class="create-article">
    <el-card class="create-article-card">
      <template #header>
        <h2>发布文章</h2>
      </template>
      
      <el-form :model="articleForm" :rules="rules" ref="articleFormRef" label-width="100px">
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
          <el-button type="primary" @click="handleSubmit" :loading="loading" style="width: 100%">
            发布文章
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { articleAPI, categoryAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const router = useRouter()
const articleFormRef = ref(null)
const loading = ref(false)
const newTag = ref('')
const categories = ref([])
const { user } = useAuth()

const articleForm = reactive({
  title: '',
  content: '',
  category: '',
  tags: [],
  cover: ''
})

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

// 获取分类列表
onMounted(async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败，使用默认分类')
    // 设置默认分类选项
    categories.value = [
      { id: 1, name: '技术' },
      { id: 2, name: '生活' },
      { id: 3, name: '感情' }
    ]
  }
})

const addTag = () => {
  if (newTag.value && !articleForm.tags.includes(newTag.value)) {
    articleForm.tags.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  const index = articleForm.tags.indexOf(tag)
  if (index > -1) {
    articleForm.tags.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!articleFormRef.value) return
  
  try {
    await articleFormRef.value.validate()
    loading.value = true
    
    // 添加作者 ID
    const formData = {
      ...articleForm,
      author_id: user.value?.id || 1 // 默认使用 ID 为 1 的用户
    }
    
    console.log('提交的文章数据:', formData)
    console.log('标签数据:', formData.tags)
    
    const response = await articleAPI.createArticle(formData)
    
    ElMessage.success('文章创建成功')
    router.push('/articles')
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.error || '创建文章失败')
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('创建文章失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-article {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.create-article-card {
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-article-card h2 {
  text-align: center;
  margin: 0;
  color: #333;
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