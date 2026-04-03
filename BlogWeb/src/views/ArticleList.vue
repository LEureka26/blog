<template>
  <div class="article-list">
    <div class="container">
      <div class="filter-bar">
        <div class="filter-item">
          <label>分类：</label>
          <el-select v-model="filter.category" placeholder="请选择分类" @change="loadArticles">
            <el-option label="全部" value=""></el-option>
            <el-option label="技术" value="技术"></el-option>
            <el-option label="生活" value="生活"></el-option>
            <el-option label="感情" value="感情"></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <el-input
            v-model="filter.search"
            placeholder="搜索文章"
            @keyup.enter="loadArticles"
          >
            <template #append>
              <el-button @click="loadArticles"><el-icon><Search /></el-icon></el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="article-grid">
        <div class="article-card" v-for="article in articles" :key="article.id">
          <router-link :to="`/articles/${article.id}`" class="article-link">
            <div v-if="article.cover" class="article-cover">
              <img :src="article.cover" :alt="article.title">
            </div>
            <div class="article-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <div class="article-meta">
                <span class="article-category">{{ article.category }}</span>
                <span class="article-views">浏览 {{ article.views || 0 }} 次</span>
              </div>
              <p class="article-excerpt">{{ truncateContent(article.content) }}</p>
              <div class="article-tags">
                <span class="tag" v-for="tag in (article.tags ? JSON.parse(article.tags) : [])" :key="tag">#{{ tag }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <div v-if="articles.length === 0" class="empty-state">
        <p>暂无文章</p>
      </div>

      <div class="pagination" v-if="articles.length > 0">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElSelect, ElOption, ElInput, ElButton, ElPagination } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { articleAPI } from '../utils/api'

const articles = ref([])
const total = ref(0)
const filter = ref({
  category: '',
  search: ''
})
const pagination = ref({
  current: 1,
  size: 10
})

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

// 加载文章列表
const loadArticles = async () => {
  try {
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.size,
      category: filter.value.category,
      search: filter.value.search
    }
    const response = await articleAPI.getArticles(params)
    // 处理后端返回的数据格式
    if (response.data && Array.isArray(response.data)) {
      // 如果 response.data 是一个数组，直接使用它
      articles.value = response.data
      total.value = response.total || 0
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
      // 如果 response.data 是一个对象，并且它有一个 data 属性，使用 response.data.data
      articles.value = response.data.data
      total.value = response.data.total || 0
    } else {
      // 否则，使用一个空数组
      articles.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  loadArticles()
}

// 处理页码变化
const handleCurrentChange = (current) => {
  pagination.value.current = current
  loadArticles()
}

// 初始化
onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.article-list {
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-size: 14px;
  color: #666;
}

.article-grid {
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

.article-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
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

.article-content {
  padding: 20px;
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

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: #999;
}

.article-category {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.article-excerpt {
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

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 10px;
}

.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .article-grid {
    grid-template-columns: 1fr;
  }
  
  .article-cover {
    height: 150px;
  }
}
</style>