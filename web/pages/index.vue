<template>
  <div class="top">
    <div class="banner">
      <div class="banner-header">
        <h1>Make & Use Seamlessly</h1>
        <p>Nodi (β) is an online node-based geometry design tool & social development environment.</p>
        <div>
          <router-link class="link--button" to="/editor/">
            Try Nodi
          </router-link>
        </div>
      </div>
      <div class="banner-image-container">
        <img class="banner-image" :src="img.whole">
      </div>
    </div>
    <div class="container px-8 pt-4">
      <section class="feature">
        <div class="text">
          <h2>Creation</h2>
          <p>
            Node-based procedural modeling in the browser.<br>
            You can create a model with a feeling of operation like <a href="https://www.grasshopper3d.com/" target="_blank">Grasshopper</a> & <a href="https://dynamobim.org/" target="_blank">Dynamo</a>.
          </p>
          <a class="link--button" href="https://nodi3d.github.io/docs/user/basics/walk-through">Learn</a>
        </div>
        <img :src="img.creation">
      </section>
      <section class="feature reverse">
        <div class="text">
          <h2>Collaboration</h2>
          <p>
            Develop on the browser & easily access & share data.<br>
            Share links to your files to get feedback & collaborate.
          </p>
        </div>
        <img :src="img.collaboration">
      </section>
      <section class="feature">
        <div class="text">
          <h2>Materialization</h2>
          <p>
            Export geometric data in <a href="https://nodi3d.github.io/docs/user/basics/files/export">various formats</a> (.obj, .stl, .dxf, etc)<br>
            Nodi plans collaboration with CAM & CNC via structural analysis & API in the future.
          </p>
        </div>
        <div class="img">
          <img :src="img.materialization">
          <i>created & shot by <a href="//vuild.co.jp/" target="_blank">VUILD</a></i>
        </div>
      </section>
      <section class="feature reverse">
        <div class="text">
          <h2>Open source</h2>
          <p>
            Nodi is being developed as an open source project on <a href="//github.com/Nodi3d/nodi">Github</a>.
            You can run it on your PC, make changes, and send a patch.
          </p>
          <a class="link--button" href="//github.com/Nodi3d/nodi">Github</a>
        </div>
        <div class="img">
          <img :src="img.opensource">
        </div>
      </section>
      <router-link class="link--button" to="/editor/">
        Try Nodi
      </router-link>
      <section class="information">
        <h2>Supported Browsers</h2>
        <p>Tested on Google Chrome, Safari</p>
      </section>
      <section class="information">
        <h2>Support</h2>
        <div class="item--support">
          <h3>Bug Reports & Troubleshooting</h3>
          <p>Nodi is under heavy development.</p>
          <p>There might be bugs or problems, please let us know about them in public issues.</p>
          <a class="link--button" href="https://github.com/Nodi3d/nodi/issues" target="_blank">Issues</a>
        </div>
        <div class="item--support">
          <h3>General Question</h3>
          <p>We are accepting questions & requests by e-mail.</p>
          <p>Please do not hesitate to consult us.</p>
          <a class="email--button" href="mailto:contact@nodi3d.com">contact@nodi3d.com</a>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang='ts'>

import Vue from 'vue';
import Component from 'vue-class-component';

import imgWhole from '~/assets/images/top/whole.png';
import imgCreation from '~/assets/images/top/creation.gif';
import imgCollaboration from '~/assets/images/top/collaboration.png';
import imgMaterialization from '~/assets/images/top/materialization.jpg';
import imgOpensource from '~/assets/images/top/opensource.png';

@Component({})
export default class IndexPage extends Vue {
  $refs!: {
  };

  img = {
    whole: imgWhole,
    creation: imgCreation,
    collaboration: imgCollaboration,
    materialization: imgMaterialization,
    opensource: imgOpensource
  };
}

</script>

<style lang="scss" scoped>

@import '~/assets/styles/foundations/common';

$link-button-width: 200px;
$link-button-padding: 20px 0px;

.top {

  .link--button {
    display: block;
    margin: 0 auto;

    width: $link-button-width;
    font-size: 24px;
    font-weight: 300;
    padding: $link-button-padding;
    margin-bottom: 80px;

    text-decoration: none;
    text-align: center;

    color: #3781e2;
    border: 1px solid #3781e2;
    border-radius: 1px;

    &:hover {
      color: white;
      border: 1px solid transparent;
      background-image: linear-gradient(145deg, #50b9ca 0%, #3781e2 100%);
    }
  }

  .banner {

    .banner-header {
      background-image: linear-gradient(145deg, #50b9ca 20%, #3781e2 100%);
      padding: 160px 0px 160px 0px;
    }

    width: 100%;
    text-align: center;
    color: white;

    h1 {
      font-weight: 100;
      font-size: 64px;
      margin: 20px 0px;
    }

    p {
      font-weight: 100;
      font-size: 24px;
    }

    a {
      background-color: white;
      margin: 40px auto;
      &:hover {
        background-color: #3781e2;
        background-image: none;
      }
    }

    div.banner-image-container {
      height: 160px;

      img.banner-image {
        display: block;
        margin: 0px auto;
        position: relative;
        top: -160px;
        height: 320px;
      }
    }

  }

  .container {
    color: #444;

    section {

      h2, h3 {
        font-weight: 300;
      }

      h2 {
        color:#111;
        font-size: 30px;
        margin-bottom: 20px;
      }

      p {
        font-size: 20px;
        font-weight: 300;
        margin-bottom: 20px;
      }

      a:not(.link--button) {
        text-decoration: none;
        color: #3781e2;
      }

      img, .img {
        box-sizing: border-box;
      }

      i {
        font-size: 1rem;
      }

    }

    a.link--button {
      margin: 80px auto;
    }

    section.feature {
      display: flex;
      width: auto;
      justify-content: center;
      box-sizing: border-box;
      margin: 0px auto 80px auto;

      div.text, img, .img {
        flex-shrink: 0;
      }

      img, .img {
        border-radius: 4px;
        height: 100%;
      }

      div.text {
        box-sizing: border-box;
        display: block;
        text-align: left;

        a.link--button {
          width: 180px;
          padding: 14px 0px;
          margin: 0 0;
        }
      }
    }

    section.information {
      margin: 0px auto 80px auto;
      text-align: center;

      .item--support {
        margin-top: 20px;

        h3 {
          margin-bottom: 5px;
          font-size: 24px;
        }
        p {
          font-size: 20px;
          margin-bottom: 5px;
        }

        a.link--button {
          margin: 40px auto 80px auto;
        }

        a.email--button {
          display: inline-block;
          margin: 10px 0px 0px 0px;
          font-size: 20px;
          color: #3781e2;

          border-bottom: 1px solid #3781e2;
          text-decoration: none;
          padding-bottom: 4px;

          &:hover {
            border-bottom: 1px solid transparent;
          }
        }

      }

    }

  }

}

@include min-screen($breakpoint-size) {
  .top {
    .container {
      section.feature {
        flex-direction: row;

        &:first-child {
          margin-top: 40px;
        }

        div.text, img, .img {
          width: 420px;
        }

        div.text {
          margin-right: 40px;
        }

        &.reverse {
          flex-direction: row-reverse;

          div.text {
            margin-right: 0px;
            margin-left: 40px;
          }
        }
      }
    }
  }
}

@include max-screen($breakpoint-size) {
  .top {
    .banner {
      .banner-header {
        padding: 50px 0px 40px 0px;
        p {
          padding: 0px 20px;
        }
      }
      .banner-image-container {
        display: none;
      }
    }

    .container {
      section.feature {
        padding: 0px 16px;
        flex-direction: column;
        div.text, img, .img {
          width: 100%;
          a.link--button {
            margin: 40px auto;
            width: $link-button-width;
            padding: $link-button-padding;
          }
        }
      }
    }
  }
}

</style>
