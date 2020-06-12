import React from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import ImageUploader from "quill-image-uploader";
import Parser from "html-react-parser";

import axios from "axios";
import "react-quill/dist/quill.snow.css";
import "./style.css";
Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/imageUploader", ImageUploader);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorHtml: "", theme: "snow" };
    this.editorRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(html) {
    const editor = this.editorRef.current.getEditor();
    const unprivilegedEditor = this.editorRef.current.makeUnprivilegedEditor(
      editor
    );
    console.log(unprivilegedEditor.getHTML());
    this.setState({ editorHtml: html });
  }

  handleThemeChange(newTheme) {
    if (newTheme === "core") newTheme = null;
    this.setState({ theme: newTheme });
  }

  imageHandler = () => {
    const input = document.createElement("input");
    const editor = this.editorRef.current.getEditor();
    const unprivilegedEditor = this.editorRef.current.makeUnprivilegedEditor(
      editor
    );
    console.log("begining");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    console.log("click event");

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("media", file);
      console.log("got position");

      const range = unprivilegedEditor.getSelection(true);
      console.log("got position");
      const respBody = await axios
        .post("http://localhost:8888/api/v1/images", formData)
        .then((resp) => resp)
        .catch((error) => error);
      console.log(respBody.data.response.path);

      this.quill.insert(range.index, "image", respBody.data.response.path);
    };
  };

  modules = {
    imageUploader: {
      upload: (file) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append("file", file);
          axios
            .post("https://go-toshvil.herokuapp.com/api/v1/media", formData)
            .then((resp) => resp)
            .then((result) => {
              console.log(result);
              resolve(result.data.response.file_url);
            })
            .catch((error) => error);
        });
      },
    },
    imageResize: {
      modules: ["Resize", "DisplaySize", "Toolbar"],
      displaySize: true,
    },
    toolbar: {
      container: [
        [
          { align: null },
          { align: "center" },
          { align: "right" },
          { align: "justify" },
        ],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image", "video"],
        ["clean"],
      ],
      // handlers: {
      //   image: this.imageHandler,
      // },
    },

    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  formats = [
    "header",
    "align",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "width",
  ];

  render() {
    return (
      <div>
        <ReactQuill
          ref={this.editorRef}
          theme={this.state.theme}
          onChange={this.handleChange}
          value={this.state.editorHtml}
          modules={this.modules}
          formats={this.formats}
          bounds={".app"}
          placeholder={this.props.placeholder}
        />
        <div className="themeSwitcher">
          <label>Theme </label>
          <select onChange={(e) => this.handleThemeChange(e.target.value)}>
            <option value="snow">Snow</option>
            <option value="bubble">Bubble</option>
            <option value="core">Core</option>
          </select>
        </div>
        <hr />
        <br />
        <br />
        <div class="quil">
          <div class="ql-editor">
            <h1>Output</h1>
            {Parser(this.state.editorHtml)}
          </div>
        </div>
        {/* <div dangerouslySetInnerHTML={{ __html: this.state.editorHtml }} /> */}
      </div>
    );
  }
}

export default App;

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
// Editor.modules = {
//   toolbar: [
//     [{ header: "1" }, { header: "2" }, { font: [] }],
//     [{ size: [] }],
//     ["bold", "italic", "underline", "strike", "blockquote"],
//     [
//       { list: "ordered" },
//       { list: "bullet" },
//       { indent: "-1" },
//       { indent: "+1" },
//     ],
//     ["link", "image", "video"],
//     ["clean"],
//   ],
//   clipboard: {
//     // toggle to add extra line breaks when pasting HTML:
//     matchVisual: false,
//   },
// };
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
// Editor.formats = [
//   "header",
//   "font",
//   "size",
//   "bold",
//   "italic",
//   "underline",
//   "strike",
//   "blockquote",
//   "list",
//   "bullet",
//   "indent",
//   "link",
//   "image",
//   "video",
// ];

/*
 * PropType validation
 */
// Editor.propTypes = {
//   placeholder: PropTypes.string,
// };
