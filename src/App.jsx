import { useState } from 'react'
import { Input, Upload, Tag, Button, Space, InputNumber, Typography } from 'antd'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons'
import './App.css'

const { Title } = Typography

function App() {
  const [quote, setQuote] = useState('')
  const [puzzleSizes, setPuzzleSizes] = useState([
    { id: 1, width: 8, height: 8 },
    { id: 2, width: 10, height: 10 }
  ])
  const [newWidth, setNewWidth] = useState(12)
  const [newHeight, setNewHeight] = useState(12)
  const [nextId, setNextId] = useState(3)

  const handleRemoveSize = (id) => {
    setPuzzleSizes(puzzleSizes.filter(size => size.id !== id))
  }

  const handleAddSize = () => {
    if (newWidth > 0 && newHeight > 0) {
      setPuzzleSizes([...puzzleSizes, {
        id: nextId,
        width: newWidth,
        height: newHeight
      }])
      setNextId(nextId + 1)
    }
  }

  const handleFileUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setQuote(e.target.result)
    }
    reader.readAsText(file)
    return false // Prevent automatic upload
  }

  const handleCheck = () => {
    // Placeholder for check logic - will be implemented later
    console.log('Checking quote:', quote)
    console.log('Puzzle sizes:', puzzleSizes)
  }

  return (
    <div className="app-container">
      <div className="content">
        <Title level={2}>Word Game Puzzle Size Checker</Title>

        <div className="section">
          <Title level={4}>Enter quote/list of quotes:</Title>
          <Input.TextArea
            placeholder="Enter your quote here..."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 8 }}
            style={{ marginBottom: 16 }}
          />

          <div style={{ textAlign: 'center', margin: '16px 0' }}>Or</div>

          <Upload
            beforeUpload={handleFileUpload}
            maxCount={1}
            accept=".txt"
          >
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
        </div>

        <div className="section">
          <Title level={4}>Choose puzzle size:</Title>
          <Space wrap style={{ marginBottom: 16 }}>
            {puzzleSizes.map(size => (
              <Tag
                key={size.id}
                closable
                onClose={() => handleRemoveSize(size.id)}
                style={{ fontSize: '14px', padding: '4px 8px' }}
              >
                {size.width}x{size.height}
              </Tag>
            ))}
          </Space>

          <div style={{ marginTop: 16 }}>
            <Space>
              <InputNumber
                min={1}
                max={50}
                value={newWidth}
                onChange={setNewWidth}
                placeholder="Width"
              />
              <span>x</span>
              <InputNumber
                min={1}
                max={50}
                value={newHeight}
                onChange={setNewHeight}
                placeholder="Height"
              />
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddSize}
              >
                Add Puzzle Size
              </Button>
            </Space>
          </div>
        </div>

        <div className="section">
          <Button
            type="primary"
            size="large"
            onClick={handleCheck}
            disabled={!quote || puzzleSizes.length === 0}
          >
            Check
          </Button>
        </div>

        <div className="section output-section">
          <Title level={4}>Output:</Title>
          <div className="output-space">
            {/* Output will be displayed here */}
            <p style={{ color: '#999', fontStyle: 'italic' }}>
              Results will appear here after checking...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
