<template>
  <div class="picker" v-show="state===1" transition="fade">
    <div class="picker-mask" @toucstart.prevent="noop"
         @touchmove.prevent="noop"></div>
    <div class="picker-panel" v-show="state===1" transition="move">
      <div class="picker-choose" @touchmove.prevent="noop">
        <span class="cancel" @click="cancel">取消</span>
        <span class="confirm" @click="confirm">确定</span>
        <h1 class="picker-title">{{title}}</h1>
      </div>
      <div class="picker-content">
        <div class="mask-top border-1px"></div>
        <div class="mask-bottom border-1px"></div>
        <div class="wheel-wrapper" @touchstart.prevent="noop" v-el:wheel-wrapper>
          <div class="wheel" v-for="data in pickerData">
            <ul class="wheel-scroll">
              <li v-for="item in data" class="wheel-item">{{item.text}}</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="picker-footer=" @toucstart.prevent="noop"></div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Wheel from './wheel';

  function noop() {
  }

  const STATE_HIDE = 0;
  const STATE_SHOW = 1;

  export default {
    props: {
      data: {
        type: Array,
        default() {
          return [];
        }
      },
      title: {
        type: String
      },
      selectedIndex: {
        type: Array
      }
    },
    data() {
      return {
        state: STATE_HIDE,
        pickerData: this.data,
        pickerSelectedIndex: this.selectedIndex,
        pickerSelectedVal: []
      };
    },
    created() {
      this.length = this.pickerData.length;
      if (!this.pickerSelectedIndex) {
        this.pickerSelectedIndex = [];
        for (let i = 0; i < this.length; i++) {
          this.pickerSelectedIndex[i] = 0;
        }
      }
    },
    methods: {
      noop: noop,
      confirm() {
        this.hide();

        let changed = false;
        for (let i = 0; i < this.length; i++) {
          let index = this.wheels[i].getSelectedIndex();
          this.pickerSelectedIndex[i] = index;

          let value = null;
          if (this.pickerData[i].length) {
            value = this.pickerData[i][index].value;
          }
          if (this.pickerSelectedVal[i] !== value) {
            changed = true;
          }
          this.pickerSelectedVal[i] = value;
        }

        this.$dispatch('picker.select', this.pickerSelectedVal, this.pickerSelectedIndex);

        if (changed) {
          this.$dispatch('picker.valuechange', this.pickerSelectedVal, this.pickerSelectedIndex);
        }
      },
      cancel() {
        this.hide();

        this.$dispatch('picker.cancel');
      },
      show() {
        this.state = STATE_SHOW;

        if (!this.wheels) {
          this.$nextTick(() => {
            this.wheels = [];
            let wheelWrapper = this.$els.wheelWrapper;
            for (let i = 0; i < this.length; i++) {
              this.wheels[i] = new Wheel(wheelWrapper.children[i], {
                tap: 'wheelTap',
                selectedIndex: this.pickerSelectedIndex[i]
              });
              ((index) => {
                this.wheels[index].on('scrollEnd', () => {
                  this.$dispatch('picker.change', index, this.wheels[index].getSelectedIndex());
                });
              })(i);
            }
          });
        } else {
          for (let i = 0; i < this.length; i++) {
            this.wheels[i].enable();
            this.wheels[i].goTo(this.pickerSelectedIndex[i]);
          }
        }
      },
      hide() {
        this.state = STATE_HIDE;

        for (let i = 0; i < this.length; i++) {
          this.wheels[i].disable();
        }
      },
      refill(data, index) {
        let wheelWrapper = this.$els.wheelWrapper;
        let scroll = wheelWrapper.children[index].querySelector('.wheel-scroll');
        let wheel = this.wheels[index];
        if (scroll && wheel) {
          let oldData = this.pickerData[index];
          this.pickerData[index] = data;

          let selectedIndex = wheel.getSelectedIndex();
          let dist = 0;
          if (oldData.length) {
            let oldValue = oldData[selectedIndex].value;
            for (let i = 0; i < data.length; i++) {
              if (data[i].value === oldValue) {
                dist = i;
                break;
              }
            }
          }
          this.pickerSelectedIndex[index] = dist;
          wheel.refresh();
          wheel.goTo(dist);
          return dist;
        }
      }
    }
  };
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "../stylus/mixin.styl"
  @import "../stylus/base.styl"

  .picker
    position: fixed
    left: 0
    top: 0
    z-index: 100
    width: 100%
    height: 100%
    overflow: hidden
    text-align: center
    font-family: 'PingFang SC', 'STHeitiSC-Light', 'Helvetica-Light', arial, sans-serif, 'Droid Sans Fallback'
    font-size: 14px
    unselectable()
    &.fade-transition
      transition: all 0.5s
      -webkit-transition: all 0.5s
      background: rgba(0, 0, 0, 0.6)
    &.fade-transition
      transition: all 0.5s
      -webkit-transition: all 0.5s
      background: rgba(0, 0, 0, 0.6)
      opacity: 1
    &.fade-enter, &.fade-leave
      background: rgba(0, 0, 0, 0)
      opacity: 0
    .picker-mask
      position: absolute
      z-index: 500
      width: 100%
      height: 100%

    .picker-panel
      position: absolute
      z-index: 600
      bottom: 0
      width: 100%
      height: 243px
      background: #fff
      &.move-transition
        transition: all 0.5s
        -webkit-transition: all 0.5s
        transform: translateY(0)
        -webkit-transform: translateY(0)
      &.move-enter, &.move-leave
        transform: translateY(243px)
        -webkit-transform: translateY(243px)
      .picker-choose
        position: relative
        height: 50px
        color: #878787
        font-size: 14px
        .picker-title
          line-height: 50px
          font-size: 19px
          text-align: center
          color: #333
        .confirm, .cancel
          position: absolute
          padding: 10px
          top: 6px
        .confirm
          right: 0
          color: #fa8919
        .cancel
          left: 0
      .picker-content
        position: relative
        .mask-top, .mask-bottom
          position: absolute
          z-index: 10
          width: 100%
          height: 68px
          pointer-events: none
        .mask-top
          border-bottom-1px(#ccc)
          top: 0
          gradient-from-bottom(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8))
        .mask-bottom
          border-top-1px(#ccc)
          bottom: 0
          gradient-from-top(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.8))
      .wheel-wrapper
        flex-box()
        padding: 0 10px
        .wheel
          flex()
          height: 173px
          overflow: hidden
          font-size: 21px
          .wheel-scroll
            margin-top: 68px
            line-height: 36px
            .wheel-item
              height: 36px
              overflow: hidden
              white-space: nowrap
              color: #333
    .picker-footer
      height: 20px
</style>