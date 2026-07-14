export interface UploadUrlRequest {
	userId: number;
	fileName: string;
	contentType: string;
}

export interface UploadUrlResponse {
	cvKey: string;
	uploadUrl: string;
}

export interface CreateApplicationRequest {
	userId: number;
	cvKey: string;
}
