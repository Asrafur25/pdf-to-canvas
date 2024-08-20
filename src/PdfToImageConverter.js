import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { jsPDF } from "jspdf";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Box } from "@mui/material";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function PdfToImageConverter() {
  const [pdfData, setPdfData] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(null);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const canvasRefs = useRef([]);

  const inputRef = useRef(null);
  const [inputStyle, setInputStyle] = useState({ display: "none" });
  const [inputValue, setInputValue] = useState("");
  const [fontSize, setFontSize] = useState(16);

  const [mode, setMode] = useState(""); // "check" or "text"
  const checkIcon = new Image();

  checkIcon.src = "/check-icon.png"; // Ensure this path is correct

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        setPdfData(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };
  const [textElements, setTextElements] = useState([]);

  useEffect(() => {
    const renderPDF = async () => {
      if (pdfData) {
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        try {
          const pdf = await loadingTask.promise;
          setNumPages(pdf.numPages);

          const canvasRefsArray = Array.from({ length: pdf.numPages }, () =>
            React.createRef()
          );
          canvasRefs.current = canvasRefsArray;

          for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = canvasRefs.current[i].current;
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            await page.render(renderContext).promise;
          }
        } catch (error) {
          console.error("Error rendering PDF:", error);
        }
      }
    };
    renderPDF();
  }, [pdfData]);

  // const handleCanvasClick = (e, index) => {
  //   if (mode === "check") {
  //     const canvas = canvasRefs.current[index].current;
  //     const context = canvas.getContext("2d");
  //     const rect = canvas.getBoundingClientRect();
  //     const x = e.clientX - rect.left;
  //     const y = e.clientY - rect.top;

  //     context.drawImage(checkIcon, x - 8, y - 8, 16, 16); // Adjust size and position
  //   } else if (mode === "text") {
  //     setCurrentCanvasIndex(index);
  //     const canvas = e.target;
  //     const rect = canvas.getBoundingClientRect();
  //     const x = e.clientX - rect.left;
  //     const y = e.clientY - rect.top;
  //     setInputPosition({ x, y });

  //     setInputStyle({
  //       position: "absolute",
  //       top: rect.top + window.scrollY + y - 177.375,
  //       left: rect.left + window.scrollX + x,
  //       display: "block",
  //     });
  //   }
  // };

  // const handleCanvasClick1 = (e, index) => {
  //   const canvas = canvasRefs.current[index].current;
  //   const context = canvas.getContext("2d");
  //   const rect = canvas.getBoundingClientRect();
  //   const x = e.clientX - rect.left;
  //   const y = e.clientY - rect.top;

  //   if (mode === "check") {
  //     context.drawImage(checkIcon, x - 8, y - 8, 16, 16); // Adjust size and position
  //   } else if (mode === "text") {
  //     setCurrentCanvasIndex(index);

  //     // Find if the click is on any existing text
  //     const clickedText = textElements.find((textElement) => {
  //       context.font = `${textElement.fontSize}px Arial`;
  //       const textWidth = context.measureText(textElement.text).width;
  //       return (
  //         textElement.canvasIndex === index &&
  //         x >= textElement.x &&
  //         x <= textElement.x + textWidth &&
  //         y >= textElement.y - textElement.fontSize &&
  //         y <= textElement.y
  //       );
  //     });

  //     if (clickedText) {
  //       // Set the input field to the clicked text position for editing
  //       setInputPosition({ x: clickedText.x, y: clickedText.y });
  //       setInputValue(clickedText.text);
  //       setFontSize(clickedText.fontSize);
  //       setInputStyle({
  //         position: "absolute",
  //         top: rect.top + window.scrollY + clickedText.y - clickedText.fontSize,
  //         left: rect.left + window.scrollX + clickedText.x,
  //         display: "block",
  //       });

  //       // Remove the clicked text from the textElements array for re-editing
  //       setTextElements((prevTextElements) =>
  //         prevTextElements.filter((textElement) => textElement !== clickedText)
  //       );

  //       // Clear the text from the canvas
  //       context.clearRect(clickedText.x, clickedText.y - clickedText.fontSize, textWidth, clickedText.fontSize);
  //     } else {
  //       // Set the input field to the clicked position for new text
  //       setInputPosition({ x, y });
  //       setInputStyle({
  //         position: "absolute",
  //         top: rect.top + window.scrollY + y - 177.375,
  //         left: rect.left + window.scrollX + x,
  //         display: "block",
  //       });
  //     }
  //   }
  // };

  const handleCanvasClick = (e, index) => {
    const canvas = canvasRefs.current[index].current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === "check") {
      context.drawImage(checkIcon, x - 8, y - 8, 16, 16); // Adjust size and position
    } else if (mode === "text") {
      setCurrentCanvasIndex(index);

      // Find if the click is on any existing text
      const clickedText = textElements.find((textElement) => {
        context.font = `${textElement.fontSize}px Arial`;
        const textWidth = context.measureText(textElement.text).width;
        return (
          textElement.canvasIndex === index &&
          x >= textElement.x &&
          x <= textElement.x + textWidth &&
          y >= textElement.y - textElement.fontSize &&
          y <= textElement.y
        );
      });

      if (clickedText) {
        console.log("click text", clickedText);
        // Calculate text width
        context.font = `${clickedText.fontSize}px Arial`;
        const textWidth = context.measureText(clickedText.text).width;

        // Set the input field to the clicked text position for editing
        setInputPosition({ x: clickedText.x, y: clickedText.y });
        setInputValue(clickedText.text);
        setFontSize(clickedText.fontSize);
        setInputStyle({
          position: "absolute",
          top: rect.top + window.scrollY + clickedText.y - clickedText.fontSize,
          left: rect.left + window.scrollX + clickedText.x,
          display: "block",
        });

        // Remove the clicked text from the textElements array for re-editing
        setTextElements((prevTextElements) =>
          prevTextElements.filter((textElement) => textElement !== clickedText)
        );

        // Clear the text from the canvas
        context.clearRect(
          clickedText.x,
          clickedText.y - clickedText.fontSize,
          textWidth,
          clickedText.fontSize
        );
      } else {
        // Set the input field to the clicked position for new text
        setInputPosition({ x, y });
        setInputStyle({
          position: "absolute",
          top: rect.top + window.scrollY + y - 177.375,
          left: rect.left + window.scrollX + x,
          display: "block",
        });
      }
    }
  };

  useEffect(() => {
    if (inputStyle.display === "block" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputStyle]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const [canvasContext, setCanvasContext] = useState(false);

  // const handleInputBlur = () => {
  //   if (currentCanvasIndex !== null) {

  //       const canvas = canvasRefs.current[currentCanvasIndex].current;

  //       const ctx = canvas.getContext("2d");
  //       setCanvasContext(ctx);

  //       console.log("texting ctx", canvasContext);
  //       ctx.font = `${fontSize}px Arial`;

  //       ctx.fillText(inputValue, inputPosition.x, inputPosition.y + fontSize);

  //       setTextElements((prevTextElements) => [
  //         ...prevTextElements,
  //         {
  //           text: inputValue,
  //           x: inputPosition.x,
  //           y: inputPosition.y,
  //           fontSize,
  //           canvasIndex: currentCanvasIndex,
  //         },
  //       ]);

  //       setInputValue("");
  //       setInputStyle({ display: "none" });
  //       setCurrentCanvasIndex(null);

  //   }
  // };

  const handleInputBlur = () => {
    if (currentCanvasIndex !== null) {
      const canvas = canvasRefs.current[currentCanvasIndex].current;
      const ctx = canvas.getContext("2d");

      // Draw the text on the canvas
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(inputValue, inputPosition.x, inputPosition.y + fontSize);

      // Add or update the text element in the textElements array
      setTextElements((prevTextElements) => [
        ...prevTextElements,
        {
          id: new Date(),
          text: inputValue,
          x: inputPosition.x,
          y: inputPosition.y,
          fontSize,
          canvasIndex: currentCanvasIndex,
        },
      ]);

      // Reset input value and hide the input field
      setInputValue("");
      setInputStyle({ display: "none" });
      setCurrentCanvasIndex(null);
    }
  };

  useEffect(() => {
    canvasRefs.current.forEach((canvasRef, index) => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.addEventListener("click", (e) => handleCanvasClick(e, index));
      }
    });

    return () => {
      canvasRefs.current.forEach((canvasRef) => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.removeEventListener("click", handleCanvasClick);
        }
      });
    };
  }, [textElements]);

  const downloadPDF = () => {
    const pdf = new jsPDF();
    canvasRefs.current.forEach((canvasRef, index) => {
      const canvas = canvasRef.current;
      const imgData = canvas.toDataURL("image/jpeg");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      if (index < canvasRefs.current.length - 1) {
        pdf.addPage();
      }
    });
    pdf.save("download.pdf");
  };

  const handleCheckButtonClick = () => {
    setMode("check");
    document.body.style.cursor = "url('/check-icon.png') 16 16, auto"; // Ensure this path is correct
    setInputStyle({ display: "none" });
  };

  const handleTextButtonClick = () => {
    setMode("text");
    document.body.style.cursor = "default";
  };

  const handleInputDragStart = (e) => {
    e.preventDefault();
    const initialX = e.clientX - inputPosition.x;
    const initialY = e.clientY - inputPosition.y;

    const handleMouseMove = (e) => {
      const newX = e.clientX - initialX;
      const newY = e.clientY - initialY;
      setInputPosition({ x: newX, y: newY });

      setInputStyle((prevStyle) => ({
        ...prevStyle,
        left: newX + window.scrollX, // Adjust for page scroll
        top: newY + window.scrollY, // Adjust for page scroll
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="App">
      <h1>Upload and Display PDF</h1>
      <ButtonGroup variant="contained" aria-label="Basic button group">
        <Button sx={{ textTransform: "none" }} onClick={handleCheckButtonClick}>
          Check
        </Button>
        <Button sx={{ textTransform: "none" }} onClick={handleTextButtonClick}>
          Text
        </Button>
      </ButtonGroup>
      <Box sx={{ mt: 5 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <div style={{ position: "relative" }}>
          {canvasRefs.current.map((canvasRef, index) => (
            <canvas
              key={index}
              ref={canvasRef}
              onClick={(e) => handleCanvasClick(e, index)}
              style={{
                border: "1px solid black",
                marginBottom: "10px",
                display: "block",
                //  cursor: mode === "check" ? "url('/check-icon.png') 16 16 auto" : "default",
                cursor: mode === "check" ? "pointer" : "default",
              }}
            ></canvas>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onMouseDown={handleInputDragStart}
            style={{
              ...inputStyle,
              fontSize: `${fontSize}px`,
              fontFamily: "Arial",
              border: "0px dashed black",
              padding: "3px",
              backgroundColor: "transparent",
            }}
          />
        </div>
        <button onClick={downloadPDF}>Download as PDF</button>
      </Box>
    </div>
  );
}

export default PdfToImageConverter;



