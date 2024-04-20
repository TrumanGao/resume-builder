<!-- https://www.npmjs.com/package/jspdf -->
<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import { useLocaleStore } from '../stores/locale'
const localeStore = useLocaleStore()
import type { ResumeJSON, Locale } from '../index.d'
import debounce from 'lodash.debounce'
import { EventManager, caniuse_webp } from 'trumangao-utils'
const _e = new EventManager()
import { downloadPDF, isWechat } from '../utils/tool'
import {
  UserOutlined,
  DownloadOutlined,
  LoadingOutlined,
  TranslationOutlined,
  BgColorsOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  MailOutlined,
  MobileOutlined,
  WechatOutlined
} from '@ant-design/icons-vue'

/**
 * 数据源
 */
const resumeJSON = ref<ResumeJSON>()
const profilePhoto = ref<string>()
const profilePhotoLoaded = ref(false)
const packageLoaded = ref(false)
function handleProfilePhotoLoaded() {
  profilePhotoLoaded.value = true
  Promise.all([import('html2canvas'), import('jspdf')])
    .then(() => (packageLoaded.value = true))
    .catch(() => (packageLoaded.value = true))
}
watch(
  () => route.params.username,
  (username) => {
    resumeJSON.value = undefined
    profilePhoto.value = undefined
    profilePhotoLoaded.value = false
    packageLoaded.value = false
    import(`../locale/resume/${username}.json`)
      .then((res) => {
        if (res.default) {
          resumeJSON.value = res.default as ResumeJSON
          /**
           * when first loaded, if the current language does not exist,
           * switch to the first existing language
           */
          if (!resumeJSON.value[localeStore.locale]) {
            localeStore.setLocale(Object.keys(resumeJSON.value)[0])
          }
        } else {
          throw new Error(localeStore.message.FILE_DID_NOT_FOUND)
        }
      })
      .catch((error) => {
        ElMessage({
          message: error.message || localeStore.message.FILE_LOAD_ERROR,
          type: 'error',
          plain: true,
          grouping: true,
          showClose: true
        })
      })

    import(`../assets/img/profile-photo/${username}.webp`)
      .then(async (res) => {
        if (!res.default) {
          throw new Error(localeStore.message.FILE_DID_NOT_FOUND)
        } else if (!caniuse_webp()) {
          throw new Error(localeStore.message.WEBP_NOT_SUPPORTED)
        } else {
          profilePhoto.value = res.default
        }
      })
      .catch(async () => {
        const res = await import(`../assets/img/profile-photo/${username}.jpg`)
        if (!res.default) {
          throw new Error(localeStore.message.FILE_DID_NOT_FOUND)
        } else {
          profilePhoto.value = res.default
        }
      })
      .catch((error) => {
        ElMessage({
          message: error.message || localeStore.message.FILE_LOAD_ERROR,
          type: 'error',
          plain: true,
          grouping: true,
          showClose: true
        })
      })
  },
  {
    immediate: true
  }
)
const resumeData = computed(() => resumeJSON.value?.[localeStore.locale])
const resumeTitle = computed(
  () => `${resumeData?.value?.profile.name}-${resumeData?.value?.profile.job}`
)
watch(resumeTitle, (title) => {
  document.title = title
})

/**
 * debounce when resize
 */
const DEBOUNCE_DURATION = 100
/**
 * resize orientation and screen size
 */
const orientation = ref('landscape')
const fontSizeRatioMin = ref(50)
const fontSizeRatioMax = ref(150)
/**
 * resize resume size
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

const PRIMARY_COLORS = [
  '#10365c',
  '#1A244C',
  '#361C5C',
  '#0A4D3E',
  '#053B2E',
  '#5C303A',
  '#3D2B23',
  '#0F171B'
]
const currentColor = ref(PRIMARY_COLORS[0])
watch(currentColor, (color) => {
  document.documentElement.style.setProperty('--color_primary-1', color)
})

const downloadLoading = ref(false)
function handleDownloadPdf() {
  if (downloadLoading.value) {
    return
  }

  if (isWechat()) {
    return ElMessage({
      message: localeStore.message.MESSAGE_OPEN_IN_BROWSER,
      type: 'warning',
      plain: true,
      grouping: true,
      showClose: true
    })
  }

  ElMessageBox.confirm(
    localeStore.message.MESSAGE_DOWNLOAD_RESUME,
    localeStore.message.MESSAGE_TITLE_INFO,
    {
      confirmButtonText: localeStore.message.MESSAGE_CONFIRM,
      cancelButtonText: localeStore.message.MESSAGE_CANCEL,
      type: 'warning'
    }
  )
    .then(() => {
      downloadLoading.value = true
      fontSizeRatio.value = 100 // fontSizeRatioMax.value
      /**
       * @warn 不能少于 debounce 的时间，即 DEBOUNCE_DURATION
       */
      setTimeout(() => {
        downloadPDF({
          element: document.querySelector('.resume-main') as HTMLElement,
          pdfName: `${resumeTitle.value}.pdf`
        })
          .then(() => setTimeout(() => (downloadLoading.value = false), 500))
          .catch(() => (downloadLoading.value = false))
      }, DEBOUNCE_DURATION + 100)
    })
    .catch(() => {})
}
</script>

<template>
  <div class="resume-view">
    <div
      class="resume-container"
      :style="{ padding: orientation === 'landscape' ? '0 5vh' : '5vh 0' }"
    >
      <!-- page -->
      <div class="resume-main" v-if="resumeData">
        <div class="resume-left">
          <section class="resume-profile left-section">
            <div class="profile-photo-container">
              <img
                v-show="profilePhotoLoaded"
                class="profile-photo"
                :src="profilePhoto"
                alt="photo"
                @load="handleProfilePhotoLoaded"
              />
              <UserOutlined v-show="!profilePhotoLoaded" class="profile-photo_placeholder" />
            </div>
            <div v-if="resumeData.profile.name" class="profile-name">
              {{ resumeData.profile.name }}
            </div>
            <div v-if="resumeData.profile.job" class="profile-job">
              {{ resumeData.profile.job }}
            </div>
          </section>

          <section v-if="Object.keys(resumeData.detail)?.length" class="resume-detail left-section">
            <div class="left-title">{{ localeStore.message.RESUME_DETAIL }}</div>
            <div v-if="resumeData.detail.origin" class="left-item">
              <HomeOutlined class="detail-icon" />
              <span class="left-text">{{ resumeData.detail.origin }}</span>
            </div>
            <div v-if="resumeData.detail.address" class="left-item">
              <EnvironmentOutlined class="detail-icon" />
              <span class="left-text">{{ resumeData.detail.address }}</span>
            </div>
            <div v-if="resumeData.detail.email" class="left-item">
              <MailOutlined class="detail-icon" />
              <span class="left-text">{{ resumeData.detail.email }}</span>
            </div>
            <div v-if="resumeData.detail.phone" class="left-item">
              <MobileOutlined class="detail-icon" />
              <span class="left-text">{{ resumeData.detail.phone }}</span>
            </div>
            <div v-if="resumeData.detail.wechat" class="left-item">
              <WechatOutlined class="detail-icon" />
              <span class="left-text">{{ resumeData.detail.wechat }}</span>
            </div>
          </section>

          <section v-if="resumeData.skill.length" class="resume-skill left-section">
            <div class="left-title">{{ localeStore.message.RESUME_SKILLS }}</div>
            <div class="left-item skill-item" v-for="skill in resumeData.skill" :key="skill">
              <div class="left-text skill-item">{{ skill }}</div>
            </div>
          </section>
        </div>

        <div class="resume-right">
          <section v-if="resumeData.statment.content" class="resume-statment right-section">
            <div class="right-title">{{ localeStore.message.RESUME_STATMENT }}</div>
            <div class="right-text statment-content">
              {{ resumeData.statment.content }}
            </div>
          </section>

          <section v-if="resumeData.education.length" class="resume-education right-section">
            <div class="right-title">{{ localeStore.message.RESUME_EDUCATION }}</div>
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
            <div class="right-title">{{ localeStore.message.RESUME_EMPLOYMENT }}</div>
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
            <div class="right-title">{{ localeStore.message.RESUME_PROJECTS }}</div>
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
            <div class="right-title">{{ localeStore.message.RESUME_LINKS }}</div>
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

    <!-- menu -->
    <div class="resume-menu">
      <section class="menu-item-wrap" v-if="packageLoaded" @click="handleDownloadPdf">
        <LoadingOutlined v-if="downloadLoading" class="menu-item is-loading" />
        <DownloadOutlined v-else class="menu-item" />
      </section>

      <el-dropdown
        class="menu-item-wrap"
        trigger="click"
        :hide-on-click="false"
        @command="(locale: Locale) => localeStore.setLocale(locale)"
      >
        <TranslationOutlined class="menu-item" />
        <template #dropdown>
          <el-dropdown-menu class="dropdown-menu_locale">
            <el-dropdown-item
              v-for="(resume, locale) in resumeJSON"
              :key="locale"
              :command="locale"
              :class="{
                'dropdown-item_locale': true,
                'dropdown-item_locale_active': locale === localeStore.locale
              }"
            >
              {{ locale }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- set primary color -->
      <el-dropdown
        class="menu-item-wrap"
        trigger="click"
        :hide-on-click="false"
        @command="(color: string) => (currentColor = color)"
      >
        <BgColorsOutlined class="menu-item" />
        <template #dropdown>
          <el-dropdown-menu class="dropdown-menu_color">
            <el-dropdown-item
              v-for="color in PRIMARY_COLORS"
              :key="color"
              :command="color"
              :class="{
                'dropdown-item_color': true,
                'dropdown-item_color_active': color === currentColor
              }"
            >
              <div class="dropdown-item-inner" :style="{ backgroundColor: color }"></div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="less" scoped>
// A4: 210 × 297
// golden ratio: 0.618
@main-width: 600rem;
@main-height: calc(@main-width / 210 * 297);
@main-left-width: calc(@main-width * 0.618 * 0.618);
@main-padding_vertical: 50rem;
@main-padding_horizontal: 38rem;
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
@font-size_minitext: 14rem;
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
  }
  .right-subtitle {
    font-size: @font-size_subtitle;
    margin-bottom: @margin-bottom_subtitle;
    font-weight: 600;
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
    color: #888888;
    white-space: normal;
    word-wrap: break-word;
  }
}

a {
  color: #000000;
  &:hover {
    color: var(--color_primary-1);
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
        background-color: var(--color_primary-1);
        color: #ffffff;
        overflow: hidden;

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
            position: relative;

            .profile-photo {
              width: @photo-size;
              height: @photo-size;
            }
            .profile-photo_placeholder {
              font-size: calc(@photo-size / 1.1);
              color: var(--color_primary-1);
              position: absolute;
              bottom: 0;
            }
          }
          .profile-name {
            font-size: 20rem;
            line-height: 2;
            letter-spacing: 1px;
            text-align: center;
          }
          .profile-job {
            font-size: 16rem;
            line-height: 1.5;
            text-align: center;
          }
        }
        .resume-detail {
          // .left-title {
          // }
          .left-item {
            display: flex;
            font-size: @font-size_text;
            .detail-icon {
              margin-right: 4rem;
              display: flex;
              align-items: center;
            }
            .left-text {
              flex-shrink: 0;
              white-space: nowrap;
            }
          }
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
    right: 8px;
    bottom: 15px;
    height: 120px;
  }

  .resume-menu {
    position: fixed;
    right: 0;
    top: 0;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    border-radius: 0 0 0 4px;
    overflow: hidden;
    background-color: #efefef;

    .menu-item-wrap {
      width: 30px;
      height: 30px;
      background-color: #ffffff;
      cursor: pointer;
      margin-right: 1px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:last-child {
        margin-right: 0;
      }

      .menu-item {
        opacity: 0.5;
        font-size: 18px;
        color: var(--color_primary-1);
      }

      &:hover,
      &:active {
        .menu-item {
          opacity: 1;
        }
      }
    }
  }
}

// set primary color
.el-dropdown__popper {
  .el-scrollbar {
    .el-scrollbar__wrap {
      .el-scrollbar__view.el-dropdown__list {
        ul.el-dropdown-menu {
          &.dropdown-menu_locale {
            :deep(.el-dropdown-menu__item.dropdown-item_locale) {
              line-height: 1;
              width: 50px;
              height: 24px;
              text-align: center;
              &:hover {
                background-color: #efefef;
              }
              &.dropdown-item_locale_active {
                font-weight: bold;
                background-color: #efefef;
              }
            }
          }

          &.dropdown-menu_color {
            padding: 5px;
            :deep(.el-dropdown-menu__item.dropdown-item_color) {
              padding: 0;
              width: 24px;
              height: 24px;
              padding: 1px;
              margin-bottom: 1px;

              &:last-child {
                margin-bottom: 0;
              }

              &:hover,
              &.dropdown-item_color_active {
                padding: 0;
              }

              .dropdown-item-inner {
                width: 100%;
                height: 100%;
                border-radius: 2px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
