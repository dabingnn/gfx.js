import { enums } from './enums';

export default class IndexBuffer {
  /**
   * @constructor
   * @param {Device} device
   * @param {INDEX_FMT_*} format
   * @param {USAGE_*} usage
   * @param {ArrayBuffer} data
   * @param {Number} numIndices
   */
  constructor(device, format, usage, data, numIndices) {
    this._device = device;
    this._format = format;
    this._usage = usage;
    this._numIndices = numIndices;

    // calculate bytes
    let bytes = 0;
    if (format === enums.INDEX_FMT_UINT8) {
      bytes = numIndices;
    } else if (format === enums.INDEX_FMT_UINT16) {
      bytes = 2 * numIndices;
    } else if (format === enums.INDEX_FMT_UINT32) {
      bytes = 4 * numIndices;
    }
    this._bytes = bytes;

    // update
    this._glID = device._gl.createBuffer();
    this.update(0, data);

    // stats
    device._stats.ib += bytes;
  }

  /**
   * @method destroy
   */
  destroy() {
    if (this._glID === -1) {
      console.error('The buffer already destroyed');
      return;
    }

    let gl = this.device.gl;
    gl.deleteBuffer(this._glID);
    this.device._stats.ib -= this.bytes;

    this._glID = -1;
  }

  /**
   * @method update
   * @param {Number} offset
   * @param {ArrayBuffer} data
   */
  update(offset, data) {
    if (this._glID === -1) {
      console.error('The buffer is destroyed');
      return;
    }

    if (data && data.byteLength + offset > this._bytes) {
      console.error('Failed to update data, bytes exceed.');
      return;
    }

    let gl = this._device._gl;
    let glUsage = this._usage;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._glID);
    if (!data) {
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._bytes, glUsage);
    } else {
      if (offset) {
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, data, glUsage);
      } else {
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, glUsage);
      }
    }
    this._device._restoreIndexBuffer();
  }

  get count () {
    return this._numIndices;
  }
}