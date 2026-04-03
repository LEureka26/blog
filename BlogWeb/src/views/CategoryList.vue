<template>
  <div class="category-list">
    <div class="header">
      <h1>分类列表</h1>
      <el-button type="primary" @click="navigateToCreateArticle">写文章</el-button>
    </div>
    
    <div class="content">
      <!-- 左侧分类列表 -->
      <div class="sidebar">
        <h2>分类</h2>
        <ul>
          <li 
            v-for="category in categories" 
            :key="category.id"
            :class="{ active: activeCategory === category.name }"
            @click="selectCategory(category.name)"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>
      
      <!-- 右侧文章列表 -->
      <div class="article-list">
        <h2>{{ activeCategory || '全部' }}分类文章</h2>
        <div class="article-card" v-for="article in filteredArticles" :key="article.id">
          <router-link :to="`/articles/${article.id}`" class="article-title">{{ article.title }}</router-link>
          
          <div class="article-content">
            <div v-if="article.cover" class="article-cover">
              <img :src="article.cover" :alt="article.title">
            </div>
            <div class="article-text">
              <p class="content-text">{{ truncateContent(article.content) }}</p>
              <div class="article-meta">
                <span class="article-tags" v-for="tag in JSON.parse(article.tags)" :key="tag">#{{ tag }}</span>
                <span class="article-views">浏览 {{ article.views || 0 }} 次</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="filteredArticles.length === 0" class="empty-state">
          <p>暂无文章</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { articleAPI, categoryAPI } from '@/utils/api'
import { ElButton } from 'element-plus'

const router = useRouter()
const categories = ref([])
const articles = ref([])
const activeCategory = ref('')

// 导航到写文章页面
const navigateToCreateArticle = () => {
  router.push('/articles/create')
}

// 选择分类
const selectCategory = (category) => {
  activeCategory.value = category
}

// 过滤文章
const filteredArticles = computed(() => {
  if (!activeCategory.value) {
    return articles.value
  }
  return articles.value.filter(article => article.category === activeCategory.value)
})

// 截断内容
const truncateContent = (content) => {
  const plainText = content.replace(/[\r\n]+/g, ' ').replace(/[\s]+/g, ' ')
  if (plainText.length > 150) {
    return plainText.substring(0, 150) + '...'
  }
  return plainText
}

// 获取分类列表
const getCategories = async () => {
  try {
    const response = await categoryAPI.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    // 设置默认分类
    categories.value = [
      { id: 1, name: '技术' },
      { id: 2, name: '生活' },
      { id: 3, name: '感情' }
    ]
  }
}

// 获取文章列表
const getArticles = async () => {
  try {
    const response = await articleAPI.getArticles()
    articles.value = response.data
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 初始化
onMounted(async () => {
  await getCategories()
  await getArticles()
})
</script>

<style scoped>
.category-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
}

.content {
  display: flex;
  gap: 30px;
}

.sidebar {
  width: 200px;
  border-right: 1px solid #e0e0e0;
  padding-right: 20px;
}

.sidebar h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.sidebar li:hover {
  color: #409eff;
}

.sidebar li.active {
  color: #409eff;
  font-weight: bold;
  border-bottom-color: #409eff;
}

.article-list {
  flex: 1;
}

.article-list h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.article-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  margin-bottom: 15px;
  display: block;
  transition: color 0.3s;
}

.article-title:hover {
  color: #409eff;
}

.article-content {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.article-cover {
  width: 40%;
  border-radius: 8px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.article-text {
  flex: 1;
}

.content-text {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.article-tags {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.article-views {
  margin-left: auto;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-right: 0;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  
  .sidebar ul {
    display: flex;
    gap: 20px;
    overflow-x: auto;
  }
  
  .sidebar li {
    border-bottom: none;
    white-space: nowrap;
  }
  
  .article-content {
    flex-direction: column;
  }
  
  .article-cover {
    width: 100%;
  }
}
</style>