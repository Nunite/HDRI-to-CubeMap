import React from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle, Button, withStyles, Paper,
  LinearProgress, Select, MenuItem, InputLabel, FormControl, TextField
} from '@material-ui/core';
import ClassNames from 'classnames';
import { procRenderSep, procRenderUnity, procRenderUE4, procRenderSourceCross } from '../../three/render/renderProc';
import { hdrProcRenderSep, hdrProcRenderUnity, hdrProcRenderUE4, hdrProcRenderSourceCross } from '../../three/render/hdrRenderProc';
import CrossLayout from './saveDialogComp/CrossLayout';
import LineLayout from './saveDialogComp/LineLayout';
import SeperateLayout from './saveDialogComp/SeperateLayout';
import SourceCrossLayout from './saveDialogComp/SourceCrossLayout';
import ResolutionSelect from './saveDialogComp/ResolutionSelect';
import FormatSelect from './saveDialogComp/FormatSelect';
const styles = theme => ({
  optionUnity: {
    width: 496,
    height: 224,
    background: '#444',
    '&:hover': {
      background: '#bbb',//'#6666ff'
      cursor: 'pointer'
    },
  },
  option: {
    width: 496,
    height: 96,
    background: '#444',
    '&:hover': {
      background: '#bbb',
      cursor: 'pointer'
    },
  },
  selected: {
    background: '#bbbbff',
    '&:hover': {
      background: '#bbbbff'
    }
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
})



class SaveDialog extends React.Component {
  state = {
    selected: 0,
    url: '',
    download: '',
    processed: false,
    processing: true,
    progress: 0,
    saveDisable: false,
    resolution: 256,
    format: 'png',
    filePrefix: 'CubeMap',
  }


  proccessFiles = () => event => {
    console.log('saving files - index =', this.state.selected);
    console.log(event.handler)
    // console.dir(document.getElementById('SaveButton'))
    // const myButton = document.getElementById('SaveButton')
    this.setState(() => ({ saveDisable: true }))

    const prefix = this.state.filePrefix || 'CubeMap';
    
    if (this.state.format === 'hdr') {
      this.hdrProccess(href => {
        this.setState(() => ({
          url: href,
          download: `${prefix}.zip`,
          processed: true,
          saveDisable: false
        }))
      });
    } else if (this.state.format === 'goldsrc') {
      this.goldSrcProcess(href => {
        this.setState(() => ({
          url: href,
          download: `${prefix}.zip`,
          processed: true,
          saveDisable: false
        }))
      });
    } else if (this.state.format === 'goldsrc_png') {
      this.goldSrcPngProcess(href => {
        this.setState(() => ({
          url: href,
          download: `${prefix}.zip`,
          processed: true,
          saveDisable: false
        }))
      });
    } else {
      this.regularProccess(href => {
        this.setState(() => ({
          url: href,
          download: `${prefix}.zip`,
          processed: true,
          saveDisable: false
        }))
      });
    }

  }
  hdrProccess = (callback) => {
    const prefix = this.state.filePrefix || 'CubeMap';
    
    if (this.state.selected === 1) {
      hdrProcRenderUnity(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix)
    }
    if (this.state.selected === 2) {
      hdrProcRenderUE4(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix)
    }
    if (this.state.selected === 3) {
      hdrProcRenderSep(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix)
    }
    if (this.state.selected === 4) {
      // Source引擎布局
      const useGoldSrcNaming = this.state.format === 'goldsrc' || this.state.format === 'goldsrc_png';
      hdrProcRenderSourceCross(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix, useGoldSrcNaming)
    }
  }
  regularProccess = (callback) => {
    const prefix = this.state.filePrefix || 'CubeMap';
    
    if (this.state.selected === 1) {
      procRenderUnity(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix)
    }
    if (this.state.selected === 2) {
      procRenderUE4(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix)
    }
    if (this.state.selected === 3) {
      procRenderSep(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix)
    }
    if (this.state.selected === 4) {
      // Source引擎布局
      const useGoldSrcNaming = this.state.format === 'goldsrc' || this.state.format === 'goldsrc_png';
      procRenderSourceCross(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix, useGoldSrcNaming)
    }
  }
  goldSrcProcess = (callback) => {
    const prefix = this.state.filePrefix || 'sky';
    
    if (this.state.selected === 3) {
      // 分离模式下使用 GoldSrc 格式，导出6个独立文件
      procRenderSep(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix, true); // 传递 true 表示使用 GoldSrc 命名格式
    } else if (this.state.selected === 4) {
      // Source引擎布局，使用GoldSrc命名，导出单一图像
      procRenderSourceCross(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix, true);
    } else {
      // 其他布局使用普通PNG格式
      this.regularProccess(callback);
    }
  }
  goldSrcPngProcess = (callback) => {
    const prefix = this.state.filePrefix || 'sky';
    
    if (this.state.selected === 3) {
      // 分离模式下使用 GoldSrc PNG 格式，导出6个独立文件
      procRenderSep(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix, false, true); // 最后一个参数表示使用GoldSrc命名但PNG格式
    } else if (this.state.selected === 4) {
      // Source引擎布局，使用GoldSrc命名，导出单一图像
      procRenderSourceCross(this.state.resolution, href => {
        callback(href);
      }, progress => {
        const { progNow, progTotal } = progress
        this.setState(() => ({ progress: progNow / progTotal * 100 }))
      }, prefix, true);
    } else {
      // 其他布局使用普通PNG格式
      this.regularProccess(callback);
    }
  }
  saveFiles = () => {
    // const myButton = document.getElementById('SaveButton')
    // console.dir(myButton)
    this.onClose();
  }
  handleSelect = (index = 0) => event => {
    console.log('works', index)
    this.setState(() => ({ selected: index }))
  }
  onSelectChange = name => event => {
    this.setState({ [name]: event.target.value });
  }
  onClose = () => {
    this.props.onClose();
    this.setState(() => ({
      url: '',
      download: '',
      processed: false,
      saveDisable: false,
      progress: 0
    }))
  }
  handlePrefixChange = (event) => {
    this.setState({ filePrefix: event.target.value });
  }
  render() {
    const { classes } = this.props;
    const { selected } = this.state;
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose}
      >
        <DialogTitle>
          设置保存选项
        </DialogTitle>
        <DialogContent style={{ height: 450 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}>
            <ResolutionSelect
              classes={classes}
              onChange={this.onSelectChange('resolution')}
              value={this.state.resolution}
            />
            <FormatSelect
              classes={classes}
              onChange={this.onSelectChange('format')}
              value={this.state.format}
            />
            <FormControl className={classes.formControl}>
              <TextField
                label="文件前缀"
                value={this.state.filePrefix}
                onChange={this.handlePrefixChange}
                margin="normal"
                placeholder="输入文件前缀"
                helperText="将用于命名导出的文件"
              />
            </FormControl>
          </div>
          <CrossLayout classes={classes} selected={selected} onClick={this.handleSelect(1)} />
          <LineLayout classes={classes} selected={selected} onClick={this.handleSelect(2)} />
          <SeperateLayout classes={classes} selected={selected} onClick={this.handleSelect(3)} />
          <SourceCrossLayout classes={classes} selected={selected} onClick={this.handleSelect(4)} />
        </DialogContent>
        <LinearProgress variant="determinate" value={this.state.progress} />

        <DialogActions>

          {this.state.processed ?
            <Button
              id={'SaveButton'}
              href={this.state.url}
              download={this.state.download}
              variant='contained'
              color='primary'
              disabled={selected === 0 || this.state.saveDisable}
              onClick={this.saveFiles}
            >
              保存
            </Button>
            :
            <Button
              variant='contained'
              disabled={selected === 0 || this.state.saveDisable}
              onClick={this.proccessFiles()}
            >
              处理
            </Button>
          }
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(SaveDialog);
