<!-- https://www.npmjs.com/package/jspdf -->
<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import { useResumeStore } from '../stores/resume'
const resumeStore = useResumeStore()
import { type ResumeData } from '../index.d'
import { downloadPDF, isWechat } from '../utils/tool'
import { EventManager } from 'trumangao-utils'
const _e = new EventManager()
import debounce from 'lodash.debounce'

/**
 * 数据源
 */
const profilePhoto = ref('')
const profilePhotoLoaded = ref(false)
const resumeData = ref<ResumeData>({
  profile: {},
  detail: {},
  skill: [],
  statment: {},
  education: [],
  employment: [],
  project: [],
  link: []
})
const resumeTitle = ref('')
watch(
  () => route.params.username,
  (username) => {
    if (!resumeStore.resumeMap[username as string]) {
      return
    }
    import(`../assets/img/profile-photo/${username}.jpg`).then((res) => {
      profilePhoto.value = res.default
    })
    resumeData.value = resumeStore.resumeMap[username as string].zh
    resumeTitle.value = `${resumeData.value.profile.name}-${resumeData.value.profile.job}`
    document.title = resumeTitle.value
  },
  {
    immediate: true
  }
)

const DEBOUNCE_DURATION = 100
/**
 * 调整屏幕尺寸/方向
 */
const orientation = ref('landscape')
const fontSizeRatioMin = ref(50)
const fontSizeRatioMax = ref(150)
/**
 * 调整简历尺寸
 */
const fontSizeInit = 0.1
const fontSizeRatio = ref(100)
function handleResize() {
  console.log(`window.innerWidth: ${window.innerWidth}, window.innerHeight: ${window.innerHeight}`)
  if (window.innerWidth > window.innerHeight) {
    orientation.value = 'landscape'
    fontSizeRatioMin.value = 50
    fontSizeRatioMax.value = 150
  } else {
    orientation.value = 'portrait'
    fontSizeRatioMin.value = 50
    fontSizeRatioMax.value = 150
  }
  if (fontSizeRatio.value < fontSizeRatioMin.value) {
    fontSizeRatio.value = fontSizeRatioMin.value
  } else if (fontSizeRatio.value > fontSizeRatioMax.value) {
    fontSizeRatio.value = fontSizeRatioMax.value
  }
  handleFontSizeRatio()
}
_e.addEventListener(
  'resize',
  debounce(handleResize, DEBOUNCE_DURATION),
  'window_resize_handleResize',
  window
)
_e.addEventListener(
  'orientationchange',
  handleResize,
  'window_orientationchange_handleResize',
  window
)
function handleFontSizeRatio() {
  console.log('fontSizeRatio: ', fontSizeRatio.value)
  if (orientation.value === 'landscape') {
    const fontSizeVW = fontSizeInit * (fontSizeRatio.value / 100)
    const fontSizePX = (window.innerWidth / 100) * fontSizeVW
    // console.log('fontSizePX:', fontSizePX)
    if (fontSizePX >= 0.6) {
      document.documentElement.style.setProperty('font-size', `${fontSizeVW}vw`)
    } else {
      document.documentElement.style.setProperty('font-size', `${0.6}px`)
    }
  } else {
    const fontSizeVH = fontSizeInit * (fontSizeRatio.value / 100)
    const fontSizePX = (window.innerHeight / 100) * fontSizeVH
    // console.log('fontSizePX:', fontSizePX)
    if (fontSizePX >= 0.6) {
      document.documentElement.style.setProperty('font-size', `${fontSizeVH}vh`)
    } else {
      document.documentElement.style.setProperty('font-size', `${0.6}px`)
    }
  }
}
const _handleFontSizeRatio = debounce(handleFontSizeRatio, DEBOUNCE_DURATION)
watch(fontSizeRatio, () => {
  _handleFontSizeRatio()
})
onMounted(() => {
  handleResize()
})

onBeforeMount(() => {
  console.log('current username:', route.params.username)
})

onBeforeUnmount(() => {
  _e.removeEventListener('resize', 'window_resize_handleResize', window)
  _e.removeEventListener('orientationchange', 'window_orientationchange_handleResize', window)
})

const downloadLoading = ref(false)
function handleDownloadPdf() {
  if (isWechat()) {
    return ElMessage({
      message: '请点击右上角，在浏览器打开',
      type: 'warning',
      plain: true,
      grouping: true,
      showClose: true
    })
  }
  if (downloadLoading.value) {
    return
  }
  downloadLoading.value = true
  fontSizeRatio.value = 100 // fontSizeRatioMax.value
  // 延迟不能少于 debounce 的时间，即 DEBOUNCE_DURATION
  setTimeout(() => {
    downloadPDF({
      element: document.querySelector('.resume-main') as HTMLElement,
      pdfName: `${resumeTitle.value}.pdf`
    })
      .then(() => setTimeout(() => (downloadLoading.value = false), 500))
      .catch(() => (downloadLoading.value = false))
  }, DEBOUNCE_DURATION + 100)
}
</script>

<template>
  <div class="resume-view">
    <div
      class="resume-container"
      :style="{ padding: orientation === 'landscape' ? '0 5vh' : '5vh 0' }"
    >
      <!-- page -->
      <div class="resume-main">
        <div class="resume-left">
          <section class="resume-profile left-section">
            <div class="profile-photo-container">
              <img
                v-show="profilePhotoLoaded"
                class="profile-photo"
                :src="profilePhoto"
                alt="照片"
                @load="() => (profilePhotoLoaded = true)"
              />
              <el-icon v-show="!profilePhotoLoaded" class="profile-photo_placeholder">
                <Avatar />
              </el-icon>
            </div>
            <div v-if="resumeData.profile.name" class="profile-name">
              {{ resumeData.profile.name }}
            </div>
            <div v-if="resumeData.profile.job" class="profile-job">
              {{ resumeData.profile.job }}
            </div>
          </section>

          <section v-if="Object.keys(resumeData.detail)?.length" class="resume-detail left-section">
            <div class="left-title">基本信息</div>
            <div v-if="resumeData.detail.origin" class="left-text right-item">
              籍贯：{{ resumeData.detail.origin }}
            </div>
            <div v-if="resumeData.detail.address" class="left-text left-item">
              现居地：{{ resumeData.detail.address }}
            </div>
            <div v-if="resumeData.detail.email" class="left-text left-item">
              邮箱：{{ resumeData.detail.email }}
            </div>
            <div v-if="resumeData.detail.phone" class="left-text left-item">
              手机号码：{{ resumeData.detail.phone }}
            </div>
            <div v-if="resumeData.detail.wechat" class="left-text left-item">
              微信：{{ resumeData.detail.wechat }}
            </div>
          </section>

          <section v-if="resumeData.skill.length" class="resume-skill left-section">
            <div class="left-title">技术栈</div>
            <div class="left-item skill-item" v-for="skill in resumeData.skill" :key="skill">
              <div class="left-text skill-item">{{ skill }}</div>
            </div>
          </section>
        </div>

        <div class="resume-right">
          <section v-if="resumeData.statment.content" class="resume-statment right-section">
            <div class="right-title">个人陈述</div>
            <div class="right-text statment-content">
              {{ resumeData.statment.content }}
            </div>
          </section>

          <section v-if="resumeData.education.length" class="resume-education right-section">
            <div class="right-title">教育经历</div>
            <div
              class="right-item education-item"
              v-for="education in resumeData.education"
              :key="education.time"
            >
              <div class="right-subtitle education-employer">
                {{ `${education.school}  ${education.degree}` }}
              </div>
              <div class="right-minitext education-time">{{ education.time }}</div>
              <div class="right-text education-description">{{ education.description }}</div>
            </div>
          </section>

          <section v-if="resumeData.employment.length" class="resume-employment right-section">
            <div class="right-title">工作经历</div>
            <div
              class="right-item employment-item"
              v-for="employment in resumeData.employment"
              :key="employment.time"
            >
              <div class="right-subtitle employment-employer">{{ employment.employer }}</div>
              <div class="right-minitext employment-time">{{ employment.time }}</div>
              <div class="right-text employment-description">{{ employment.description }}</div>
            </div>
          </section>

          <section v-if="resumeData.project.length" class="resume-project right-section">
            <div class="right-title">项目作品</div>
            <div
              class="right-item project-item"
              v-for="project in resumeData.project"
              :key="project.url"
            >
              <div class="right-subtitle project-label">{{ project.label }}</div>
              <a class="right-text project-url" :href="project.url" target="_blank">
                {{ project.url }}
              </a>
            </div>
          </section>

          <section v-if="resumeData.link.length" class="resume-link right-section">
            <div class="right-title">个人主页</div>
            <div class="right-item link-item" v-for="link in resumeData.link" :key="link.url">
              <div class="right-subtitle link-label">{{ link.label }}</div>
              <a class="right-text link-url" :href="link.url" target="_blank">
                {{ link.url }}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- zoom -->
    <el-slider
      class="resume-zoom"
      v-model="fontSizeRatio"
      :min="fontSizeRatioMin"
      :max="fontSizeRatioMax"
      :step="2"
      vertical
      placement="left"
    />
    <el-button type="plain" class="resume-download" @click="handleDownloadPdf">
      <el-icon :class="{ 'is-loading': downloadLoading }" v-show="downloadLoading">
        <Loading />
      </el-icon>
      <span v-show="!downloadLoading">下载PDF</span>
    </el-button>
  </div>
</template>

<style lang="less" scoped>
// A4: 210 × 297
// golden ratio: 0.618
@main-width: 600rem;
@main-height: calc(@main-width / 210 * 297);
@main-left-width: calc(@main-width * 0.618 * 0.618);
@main-padding_vertical: 50rem;
@main-padding_horizontal: 40rem;
@photo-size: calc(@main-left-width - @main-padding_horizontal * 2);

@margin-bottom_left-section: 30rem;
@margin-bottom_left-item: 5rem;
@margin-bottom_right-section: 20rem;
@margin-bottom_right-item: 5rem;

@font-size_title: 16rem;
@margin-bottom_title: 5rem;
@font-size_subtitle: 14rem;
@margin-bottom_subtitle: 2rem;
@font-size_text: 14rem;
@margin-bottom_text: 2rem;
@font-size_minitext: 12rem;
@margin-bottom_minitext: 2rem;

.resume-main {
  .resume-left,
  .resume-right {
    padding: @main-padding_vertical @main-padding_horizontal;
  }
  .left-section {
    margin-bottom: @margin-bottom_left-section;
  }
  .right-section {
    margin-bottom: @margin-bottom_right-section;
  }
  .left-item {
    margin-bottom: @margin-bottom_left-item;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .right-item {
    margin-bottom: @margin-bottom_right-item;
    &:last-child {
      margin-bottom: 0;
    }
  }

  .left-title,
  .right-title {
    font-size: @font-size_title;
    margin-bottom: @margin-bottom_title;
    font-weight: 800;
    white-space: normal;
    word-wrap: break-word;
  }
  .right-subtitle {
    font-size: @font-size_subtitle;
    margin-bottom: @margin-bottom_subtitle;
    font-weight: 600;
    white-space: normal;
    word-wrap: break-word;
  }
  .left-text,
  .right-text {
    font-size: @font-size_text;
    margin-bottom: @margin-bottom_text;
    font-weight: 400;
    white-space: normal;
    word-wrap: break-word;
  }
  .right-minitext {
    font-size: @font-size_minitext;
    margin-bottom: @margin-bottom_minitext;
    font-weight: 400;
    color: #999999;
    white-space: normal;
    word-wrap: break-word;
  }
}

a {
  color: #000000;
  &:hover {
    color: var(--color_blue-1);
  }
}

.resume-view {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  overflow-x: auto;

  .resume-container {
    position: absolute;
    min-width: 100vw;
    min-height: 100vh;
    background-color: var(--color_gray-1);
    display: flex;
    justify-content: center;
    align-items: center;

    .resume-main {
      width: @main-width;
      height: @main-height;
      background-color: #ffffff;
      overflow: hidden;
      display: flex;

      .resume-left {
        width: @main-left-width;
        height: @main-height;
        background-color: var(--color_blue-1);
        color: #ffffff;

        .resume-profile {
          display: flex;
          flex-direction: column;
          align-items: center;

          .profile-photo-container {
            width: @photo-size;
            height: @photo-size;
            border-radius: 50%;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: start;
            background-color: #ffffff;
            margin-bottom: 5rem;

            .profile-photo {
              width: calc(@photo-size * 1.3);
              height: calc(@photo-size * 1.3);
            }
            .profile-photo_placeholder {
              font-size: @photo-size;
              position: relative;
              &::after {
                content: '';
                display: block;
                background-color: var(--color_blue-1);
                position: absolute;
                bottom: 0;
                width: calc(@photo-size);
                height: calc(@photo-size / 5);
              }
            }
          }
          .profile-name {
            font-size: 20rem;
            line-height: 2;
            letter-spacing: 1px;
          }
          .profile-job {
            font-size: 14rem;
            line-height: 1.5;
            letter-spacing: 1px;
          }
        }
        .resume-detail {
          // .left-title {
          // }
          // .left-text {
          // }
        }
        .resume-skill {
          // .left-title {
          // }
          // .left-text {
          // }
        }
      }

      .resume-right {
        width: calc(@main-width - @main-left-width);
        height: @main-height;
        background-color: #ffffff;
        color: #000000;

        .resume-statment {
          // .right-title {
          // }
          // .right-text {
          // }
        }
        .resume-employment {
          // .right-title {
          // }
          .employment-item {
            // .right-subtitle {
            // }
            // .right-minitext {
            // }
            // .right-text {
            // }
          }
        }
        .resume-education {
          // .right-title {
          // }
          .education-item {
            // .right-subtitle {
            // }
            // .right-minitext {
            // }
            // .right-text {
            // }
          }
        }
        .resume-link {
          // .right-title {
          // }
          .link-item {
            // .right-subtitle {
            // }
            // .right-text {
            // }
          }
        }
        .resume-project {
          // .right-title {
          // }
          .project-item {
            // .right-subtitle {
            // }
            // .right-text {
            // }
          }
        }
      }
    }
  }

  .resume-zoom {
    position: fixed;
    right: 2vw;
    bottom: 5vh;
    height: 30vh;
  }

  .resume-download {
    width: 90px;
    position: fixed;
    right: 4vw;
    top: 5vh;

    .el-icon {
      font-size: 20px;
    }
    span {
      margin-left: 0;
    }
  }
}
</style>
