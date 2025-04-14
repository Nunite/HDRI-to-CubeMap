import React from 'react';
import { Paper } from '@material-ui/core';
import ClassNames from 'classnames';

const SourceCrossLayout = (props) => {
  const { classes, selected, onClick } = props;
  const boxSize = 60;
  
  return (
    <Paper 
      className={ClassNames(classes.option, {[classes.selected]:selected === 4})}
      onClick={onClick}
      style={{ margin: '20px 0', position: 'relative', height: '224px' }}
    >
      <div style={{
        position: 'absolute',
        left: 8,
        top: 8,
        padding: 4,
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        borderRadius: 4,
        fontSize: 12
      }}>
        Source引擎十字形布局 (单一图像)
      </div>
      
      {/* Up */}
      <div style={{
        position: 'absolute',
        width: boxSize,
        height: boxSize,
        backgroundColor: '#666',
        border: '1px solid #999',
        left: 218,
        top: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        U
      </div>
      
      {/* Left */}
      <div style={{
        position: 'absolute',
        width: boxSize,
        height: boxSize,
        backgroundColor: '#666',
        border: '1px solid #999',
        left: 54,
        top: 82,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        L
      </div>
      
      {/* Back */}
      <div style={{
        position: 'absolute',
        width: boxSize,
        height: boxSize,
        backgroundColor: '#666',
        border: '1px solid #999',
        left: 136,
        top: 82,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        B
      </div>
      
      {/* Right */}
      <div style={{
        position: 'absolute',
        width: boxSize,
        height: boxSize,
        backgroundColor: '#666',
        border: '1px solid #999',
        left: 218,
        top: 82,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        R
      </div>
      
      {/* Front */}
      <div style={{
        position: 'absolute',
        width: boxSize,
        height: boxSize,
        backgroundColor: '#666',
        border: '1px solid #999',
        left: 300,
        top: 82,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        F
      </div>
      
      {/* Down */}
      <div style={{
        position: 'absolute',
        width: boxSize,
        height: boxSize,
        backgroundColor: '#666',
        border: '1px solid #999',
        left: 218,
        top: 144,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        D
      </div>
      
      {/* Reset Button - 仅为示意
      <div style={{
        position: 'absolute',
        width: 50, 
        height: 20,
        backgroundColor: '#444',
        border: '1px solid #999',
        left: 116,
        top: 25,
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        
      </div> */}
    </Paper>
  );
}

export default SourceCrossLayout; 