
import React, { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileAnalyzed: (fileName: string, fileType: string) => void;
}

const FileUpload = ({ onFileAnalyzed }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload an image (JPG, PNG, WEBP) or PDF file.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      onFileAnalyzed(file.name, fileType);
      setAnalyzing(false);
      
      toast({
        title: "File Analyzed Successfully",
        description: `Extracted product information from ${file.name}`,
      });
    }, 2000);
  }, [onFileAnalyzed, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getFileIcon = () => {
    return <Package className="h-8 w-8 text-emerald-600" />;
  };

  return (
    <Card className="border-emerald-200">
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-emerald-300 hover:border-emerald-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {analyzing ? (
            <div className="space-y-4">
              <div className="animate-spin text-emerald-600">
                <Upload className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-emerald-700 font-medium">Analyzing file with AI...</p>
              <p className="text-sm text-gray-600">
                Extracting product information, ingredients, and environmental data
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFileIcon()}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Product Information
                </h3>
                <p className="text-gray-600 mb-4">
                  Drop files here or click to upload product images, labels, or documents
                </p>
                <div className="flex justify-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Image className="h-4 w-4" />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>PDFs</span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf,.txt"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </label>
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG, WEBP, PDF • Max file size: 10MB
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
