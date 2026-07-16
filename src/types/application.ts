export interface UploadUrlRequest {
	userId: string;
	fileName: string;
	contentType: string;
}

export interface UploadUrlResponse {
	cvKey: string;
	uploadUrl: string;
}

export interface CreateApplicationRequest {
	userId: string;
	cvKey: string;
}
