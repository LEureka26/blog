<template>
  <div class="category-list">
    <div class="container">
      <div class="header">
        <h1>分类列表</h1>
        <el-button type="primary" @click="navigateToCreateArticle">写文章</el-button>
      </div>

      <div class="category-container">
        <!-- 左侧分类列表 -->
        <div class="category-sidebar">
          <h2>分类</h2>
          <ul class="category-menu">
            <li 
              class="category-item" 
              :class="{ active: !activeCategory }"
              @click="selectCategory('')"
            >
              全部
            </li>
            <li 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              :class="{ active: activeCategory === category.name }"
              @click="selectCategory(category.name)"
            >
              {{ category.name }}
            </li>
          </ul>
        </div>

        <!-- 右侧文章列表 -->
        <div class="article-list">
          <div class="article-card" v-for="article in filteredArticles" :key="article.id">
            <router-link :to="`/articles/${article.id}`" class="article-link">
              <div class="article-content">
                <div v-if="article.cover" class="article-cover">
                  <img :src="article.cover" :alt="article.title">
                </div>
                <div class="article-text">
                  <h3 class="article-title">{{ article.title }}</h3>
                  <p class="content-text">{{ truncateContent(article.content) }}</p>
                  <div class="article-meta">
                    <span class="article-tags" v-for="tag in getArticleTags(article.tags)" :key="tag">#{{ tag }}</span>
                    <span class="article-views">浏览 {{ article.views || 0 }} 次</span>
                  </div>
                </div>
              </div>
            </router-link>
          </div>

          <div v-if="filteredArticles.length === 0" class="empty-state">
            <p>暂无文章</p>
          </div>
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
  if (!Array.isArray(articles.value)) {
    return []
  }
  if (!activeCategory.value) {
    return articles.value
  }
  return articles.value.filter(article => article.category === activeCategory.value)
})

// 处理文章标签
const getArticleTags = (tags) => {
  if (!tags) {
    return []
  }
  try {
    return JSON.parse(tags)
  } catch (error) {
    console.error('解析标签失败:', error)
    return []
  }
}

// 截断内容
const truncateContent = (content) => {
  if (!content) {
    return ''
  }
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
    console.log('开始获取文章列表...')
    const response = await articleAPI.getArticles()
    console.log('获取文章列表响应:', response)
    console.log('响应数据:', response.data)
    // 处理后端返回的数据格式
    if (response.data && Array.isArray(response.data)) {
      // 如果 response.data 是一个数组，直接使用它
      articles.value = response.data
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
      // 如果 response.data 是一个对象，并且它有一个 data 属性，使用 response.data.data
      articles.value = response.data.data
    } else {
      // 否则，使用一个空数组
      articles.value = []
    }
    console.log('处理后的文章列表:', articles.value)
    // 处理文章标签
    if (Array.isArray(articles.value)) {
      articles.value.forEach(article => {
        if (!article.tags) {
          article.tags = '[]'
        }
      })
    }
    console.log('处理标签后的文章列表:', articles.value)
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 初始化
onMounted(async () => {
  console.log('开始初始化...')
  await getCategories()
  console.log('获取分类列表完成')
  await getArticles()
  console.log('获取文章列表完成')
})
</script>

<style scoped>
.category-list {
  padding: 20px;
}

.container {
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
  color: #333;
}

.category-container {
  display: flex;
  gap: 30px;
}

.category-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.category-sidebar h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.category-menu {
  list-style: none;
}

.category-item {
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  color: #333;
}

.category-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.category-item.active {
  background: #409eff;
  color: #fff;
}

.article-list {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.article-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.article-link {
  display: block;
  text-decoration: none;
  color: #333;
}

.article-content {
  padding: 20px;
}

.article-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: 15px;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  transition: color 0.3s;
}

.article-card:hover .article-title {
  color: #409eff;
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
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.article-tags {
  display: flex;
  gap: 8px;
}

.article-tags span {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .category-container {
    flex-direction: column;
  }
  
  .category-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .category-menu {
    display: flex;
    overflow-x: auto;
    gap: 10px;
  }
  
  .category-item {
    white-space: nowrap;
    margin-bottom: 0;
  }
  
  .article-list {
    grid-template-columns: 1fr;
  }
}
</style>