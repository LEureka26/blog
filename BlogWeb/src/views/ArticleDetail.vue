<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...请稍等</span>
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
    <div v-else-if="article" class="article-content">
      <div class="article-header">
        <h1>{{ article.title }}</h1>
        <div class="article-meta">
          <span class="category">{{ article.category }}</span>
          <span class="date">{{ formatDate(article.created_at) }}</span>
          <span class="views">{{ article.views }} 浏览</span>
        </div>
      </div>
      <div v-if="article.cover" class="article-cover">
        <img :src="article.cover" alt="文章封面">
      </div>
      <div class="article-body">
        <div v-html="article.content"></div>
      </div>
      <div v-if="article.tags" class="article-tags">
        <span v-for="(tag, index) in article.tags.slice(0, 2)" :key="index" class="tag">
          #{{ tag }}
        </span>
      </div>
      <div class="article-actions">
        <el-button type="primary" @click="editArticle">编辑文章</el-button>
        <el-button type="danger" @click="confirmDelete">删除文章</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { articleAPI } from '../utils/api'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const loading = ref(true)
const error = ref(null)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取文章详情
const getArticleDetail = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id
    const response = await articleAPI.getArticle(id)
    // 处理 tags 字段，将 JSON 字符串转换为数组
    if (response.data.tags) {
      try {
        response.data.tags = JSON.parse(response.data.tags)
      } catch (e) {
        // console.error('解析 tags 失败:', e)
        response.data.tags = []
      }
    }
    article.value = response.data
  } catch (err) {
    // console.error('获取文章详情失败:', err)
    error.value = '获取文章详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 编辑文章
const editArticle = () => {
  router.push(`/articles/edit/${article.value.id}`)
}

// 确认删除
const confirmDelete = () => {
  ElMessageBox.confirm('确定要删除这篇文章吗？此操作不可恢复。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await articleAPI.deleteArticle(article.value.id, {
        author_id: article.value.author_id
      })
      ElMessage.success('文章删除成功')
      router.push('/articles')
    } catch (err) {
      // console.error('删除文章失败:', err)
      ElMessage.error('删除文章失败，请稍后重试')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 组件挂载时获取文章详情
onMounted(() => {
  getArticleDetail()
})
</script>

<style scoped>
.article-detail {
  width: 70%;
  max-width: 800px;
  margin: 20px auto 0;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

.article-content {
  margin-top: 20px;
}

.article-header {
  margin-bottom: 20px;
}

.article-header h1 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.article-meta {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #999;
}

.article-meta span {
  margin-right: 15px;
}

.category {
  background-color: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.article-cover {
  margin-bottom: 20px;
  text-align: center;
}

.article-cover img {
  width: 90%;
  max-width: 600px;
  height: 300px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.article-body {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #333;
  text-indent: 2em;
  text-align: left;
}

.article-body h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0 10px;
}

.article-body p {
  margin-bottom: 10px;
}

.article-body img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}

.article-tags {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
}

.tag {
  display: inline-block;
  background-color: #ecf5ff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #409eff;
  margin-right: 20px;
}

.article-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
}

/* 保持平板布局尺寸，不随窗口缩放改变 */
  .tag {
    padding: 3px 10px;
    font-size: 10px;
  }
  
  .article-actions {
    margin-top: 20px;
  }
  
  .article-actions button {
    font-size: 14px;
    padding: 8px 16px;
  }
  
  .loading {
    height: 150px;
    font-size: 16px;
  }
  
  .loading .el-icon {
    font-size: 20px;
  }

</style>