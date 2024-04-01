<!-- https://www.npmjs.com/package/jspdf -->
<script setup lang="ts">
import { onBeforeMount, ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import { useResumeStore } from '../stores/resume'
const resumeStore = useResumeStore()
import { type ResumeData } from '../index.d'
import { downloadPDF } from '../utils/tool'

/**
 * 数据源
 */
const profilePhoto = ref('')
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
watch(
  () => route.params.username,
  async (username) => {
    if (!resumeStore.resumeMap[username as string]) {
      return
    }
    resumeData.value = resumeStore.resumeMap[username as string]
    profilePhoto.value = (await import(`../assets/img/profile-photo/${username}.jpg`)).default
  },
  {
    immediate: true
  }
)

/**
 * 尺寸
 */
const fontSizeInit = 0.1
const fontSizeRatio = ref(100)
watch(
  fontSizeRatio,
  (ratio) => {
    if (window.innerWidth > window.innerHeight) {
      document.documentElement.style.setProperty('font-size', `${fontSizeInit * (ratio / 100)}vw`)
    } else {
      document.documentElement.style.setProperty('font-size', `${fontSizeInit * (ratio / 100)}vh`)
    }
  },
  {
    immediate: true
  }
)

onBeforeMount(() => {
  console.log('current username:', route.params.username)
})

function handleDownloadPdf() {
  fontSizeRatio.value = 100
  nextTick(() => {
    downloadPDF({
      element: document.querySelector('.resume-main') as HTMLElement,
      pdfName: `${resumeData.value.profile.name}-${resumeData.value.profile.job}.pdf`
    })
  })
}
</script>

<template>
  <div class="resume-view">
    <div class="resume-container">
      <!-- page -->
      <div class="resume-main">
        <div class="resume-left">
          <section class="resume-profile">
            <div class="profile-photo-container">
              <img class="profile-photo" :src="profilePhoto" alt="照片" />
            </div>
            <div v-if="resumeData.profile.name" class="profile-name">
              {{ resumeData.profile.name }}
            </div>
            <div v-if="resumeData.profile.job" class="profile-job">
              {{ resumeData.profile.job }}
            </div>
            <div class="left-margin"></div>
          </section>

          <section v-if="Object.keys(resumeData.detail)?.length" class="resume-detail">
            <div class="left-title">基本信息</div>
            <div v-if="resumeData.detail.origin" class="left-text detail-origin">
              籍贯：{{ resumeData.detail.origin }}
            </div>
            <div v-if="resumeData.detail.address" class="left-text detail-address">
              现居地：{{ resumeData.detail.address }}
            </div>
            <div v-if="resumeData.detail.email" class="left-text detail-email">
              邮箱：{{ resumeData.detail.email }}
            </div>
            <div v-if="resumeData.detail.phone" class="left-text detail-phone">
              联系方式：{{ resumeData.detail.phone }}
            </div>
            <div v-if="resumeData.detail.wechat" class="left-text detail-wechat">
              微信：{{ resumeData.detail.wechat }}
            </div>
            <div class="left-margin"></div>
          </section>

          <section v-if="resumeData.skill.length" class="resume-skill">
            <div class="left-title">技术栈</div>
            <div class="left-item skill-item" v-for="skill in resumeData.skill" :key="skill">
              <div class="left-text skill-item">{{ skill }}</div>
            </div>
          </section>
        </div>

        <div class="resume-right">
          <section v-if="resumeData.statment.content" class="resume-statment">
            <div class="right-title">个人陈述</div>
            <div class="right-text statment-content">
              {{ resumeData.statment.content }}
            </div>
            <div class="right-margin"></div>
          </section>

          <section v-if="resumeData.education.length" class="resume-education">
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
            <div class="right-margin"></div>
          </section>

          <section v-if="resumeData.employment.length" class="resume-employment">
            <div class="right-title">工作履历</div>
            <div
              class="right-item employment-item"
              v-for="employment in resumeData.employment"
              :key="employment.time"
            >
              <div class="right-subtitle employment-employer">{{ employment.employer }}</div>
              <div class="right-minitext employment-time">{{ employment.time }}</div>
              <div class="right-text employment-description">{{ employment.description }}</div>
            </div>
            <div class="right-margin"></div>
          </section>

          <section v-if="resumeData.project.length" class="resume-project">
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
            <div class="right-margin"></div>
          </section>

          <section v-if="resumeData.link.length" class="resume-link">
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
      :min="50"
      :max="150"
      :step="5"
      vertical
      placement="left"
    />

    <el-button type="plain" class="resume-download" @click="handleDownloadPdf">下载PDF</el-button>
  </div>
</template>

<style lang="less" scoped>
// A4: 210 × 297
// golden ratio: 0.618
@main-width: 600rem;
@main-height: calc(@main-width / 210 * 297);
@main-left-width: calc(@main-width * 0.618 * 0.618);
@main-padding_vertical: 60rem;
@main-padding_horizontal: 40rem;
@photo-size: calc(@main-left-width - @main-padding_horizontal * 2);

.resume-main {
  .resume-left,
  .resume-right {
    padding: @main-padding_vertical @main-padding_horizontal;
  }
  .left-item {
    margin-bottom: 5rem;
  }
  .right-item {
    margin-bottom: 5rem;
  }
  .left-margin {
    margin-bottom: 30rem;
  }
  .right-margin {
    margin-bottom: 15rem;
  }

  .left-title,
  .right-title {
    font-size: 16rem;
    line-height: 2;
    font-weight: 800;
    white-space: normal;
    word-wrap: break-word;
    margin-bottom: 2rem;
  }
  .right-subtitle {
    font-size: 14rem;
    line-height: 1.5;
    font-weight: 600;
    white-space: normal;
    word-wrap: break-word;
    margin-bottom: 2rem;
  }
  .left-text,
  .right-text {
    font-size: 12rem;
    line-height: 1.5;
    font-weight: 400;
    white-space: normal;
    word-wrap: break-word;
    margin-bottom: 2rem;
  }
  .right-minitext {
    font-size: 12rem;
    line-height: 1.2;
    font-weight: 400;
    color: #999999;
    white-space: normal;
    word-wrap: break-word;
    margin-bottom: 2rem;
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
  overflow-x: hidden;

  .resume-container {
    position: absolute;
    width: 100vw;
    min-height: 100vh;
    padding: 5vh 0;
    background-color: var(--color_gray-1);
    display: flex;
    justify-content: center;
    align-items: center;

    .resume-main {
      width: @main-width;
      height: @main-height;
      background-color: #ffffff;
      border-radius: 5rem;
      overflow: hidden;
      display: flex;

      .resume-left {
        width: @main-left-width;
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
    position: fixed;
    right: 4vw;
    top: 5vh;
    letter-spacing: 0.1vh;
  }
}
</style>
