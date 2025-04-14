import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';

const FormatSelect = (props) => {
  return (
    <FormControl className={props.classes.formControl}>
      <InputLabel>格式</InputLabel>
      <Select
        value={props.value}
        onChange={props.onChange}
      >
        <MenuItem value={'png'}>PNG</MenuItem>
        <MenuItem value={'hdr'}>HDR</MenuItem>
        <MenuItem value={'goldsrc'}>GoldSrc (TGA)</MenuItem>
        <MenuItem value={'goldsrc_png'}>GoldSrc (PNG)</MenuItem>
      </Select>
    </FormControl>
  )
}

export default FormatSelect;