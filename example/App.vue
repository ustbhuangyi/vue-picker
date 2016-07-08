<template>
  <div id="app">
    <section class="page-header">
      <h1 class="project-name">vue-picker</h1>
      <h2 class="project-tagline">Vue picker for mobile webapp, inspired by ios UIPickerView </h2>
      <a href="https://github.com/ustbhuangyi/vue-picker" class="btn">View on GitHub</a>
      <a href="https://github.com/ustbhuangyi/vue-picker/archive/master.zip" class="btn">Download .zip</a>
      <a href="https://github.com/ustbhuangyi/vue-picker/archive/master.tar.gz" class="btn">Download .tar.gz</a>
    </section>

    <section class="main-content">
      <h3>单列筛选器</h3>

      <div @click="showPicker(0)" v-el:select0>点击选择</div>
      <picker @picker.select="handleSelect(0,$arguments)" v-ref:picker0 :data="data[0]"
              :selected-index="selectedIndex[0]"
              :title="title[0]"></picker>

      <h3>两列筛选器</h3>

      <div @click="showPicker(1)" v-el:select1>点击选择</div>
      <picker @picker.select="handleSelect(1,$arguments)" v-ref:picker1 :data="data[1]"
              :selected-index="selectedIndex[1]"
              :title="title[1]"></picker>

      <h3>三列选择器</h3>

      <div @click="showPicker(2)" v-el:select2>点击选择</div>
      <picker @picker.select="handleSelect(2,$arguments)" v-ref:picker2 :data="data[2]"
              :selected-index="selectedIndex[2]"
              :title="title[2]"></picker>

      <h3>变化选择器</h3>

      <div @click="showPicker(3)" v-el:select3>点击选择</div>
      <picker @picker.select="handleSelect(3,$arguments)" v-ref:picker3 :data="data[3]"
              :selected-index="selectedIndex[3]" :title="title[3]"></picker>


      <footer class="site-footer">
    <span class="site-footer-owner"><a href="https://github.com/ustbhuangyi/picker">vue-picker</a> is maintained by <a
        href="https://github.com/ustbhuangyi">ustbhuangyi</a>.</span>

      </footer>

    </section>
  </div>
</template>

<script type="text/ecmascript-6">
  import picker from '../src/picker';

  let data1 = [
    {
      text: '剧毒',
      value: 1
    }, {
      text: '蚂蚁',
      value: 2
    },
    {
      text: '幽鬼',
      value: 3
    },
    {
      text: '主宰',
      value: 4
    },
    {
      text: '卡尔',
      value: 5
    },
    {
      text: '宙斯',
      value: 6
    },
    {
      text: '巫医',
      value: 7
    }, {
      text: '巫妖',
      value: 8
    },
    {
      text: '神谕者',
      value: 9
    },
    {
      text: '撼地神牛',
      value: 10
    },
    {
      text: '蓝胖子',
      value: 11
    },
    {
      text: '水晶室女',
      value: 12
    },
    {
      text: '莉娜',
      value: 13
    },
    {
      text: '斯拉克',
      value: 14
    },
    {
      text: '斯拉达',
      value: 15
    }
  ];

  let data2 = [
    {
      text: '输出',
      value: 'a'
    }, {
      text: '控制',
      value: 'b'
    },
    {
      text: '核心',
      value: 'c'
    },
    {
      text: '爆发',
      value: 'd'
    },
    {
      text: '辅助',
      value: 'e'
    },
    {
      text: '打野',
      value: 'f'
    },
    {
      text: '逃生',
      value: 'g'
    }, {
      text: '先手',
      value: 'h'
    }
  ];

  let data3 = [
    {
      text: '梅肯',
      value: 's'
    }, {
      text: '秘法鞋',
      value: 'ss'
    },
    {
      text: '假腿',
      value: 'sss'
    },
    {
      text: '飞鞋',
      value: 'ssss'
    },
    {
      text: '辉耀',
      value: 'sssss'
    },
    {
      text: '金箍棒',
      value: 'ssssss'
    }
  ];

  let _data = [data1, data2, data3];

  export default {
    data() {
      return {
        data: [
          [data1],
          [data1, data2],
          [data1, data2, data3],
          [_data[0]]
        ],
        selectedIndex: [
          [0],
          [1, 0],
          [0, 1, 2],
          [0]
        ],
        title: [
          '单列选择器',
          '两列选择器',
          '三列选择器',
          '变化选择器'
        ],
        index: 0
      };
    },
    components: {
      picker
    },
    methods: {
      showPicker(index) {
        this.$refs['picker' + index].show(() => {
          if (index === 3) {
            this.index = (this.index + 1) % 3;
            this.$refs.picker3.refill(_data[this.index], 0);
          }
        });
      },
      handleSelect(index, args) {
        let el = this.$els['select' + index];
        let [selectedVal, selectedIndex] = args;
        let data;
        if (index === 3) {
          data = [_data[this.index]];
        } else {
          data = this.data[index];
        }
        let text = '';
        for (let i = 0; i < data.length; i++) {
          text += data[i][selectedIndex[i]].text + ' ';
        }
        el.innerText = text;
        console.log(selectedVal);
      }
    }
  };
</script>
