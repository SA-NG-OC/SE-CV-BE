export interface GoogleUserDto {
    email: string;
    oauth_provider: string; // 'google', 'github',...
    oauth_provider_id: string;
    //avatar_url?: string;
    //full_name?: string;
}