# Bắt đầu từ Ubuntu mới nhất
FROM ubuntu

# Thiết lập thư mục làm việc
WORKDIR /src

# Cập nhật danh sách các gói phần mềm
RUN apt-get update -y && apt-get upgrade -y

# Cài đặt các công cụ cần thiết
RUN apt-get install -y nginx curl

# Cài đặt Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs

# Xóa file cấu hình Nginx mặc định và sao chép file cấu hình mới
RUN rm -f /etc/nginx/sites-enabled/default && \
    rm -f /etc/nginx/sites-available/default

# Sao chép file cấu hình Nginx vào container
COPY nginx.conf /etc/nginx/sites-available/default

# Tạo symbolic link để kích hoạt cấu hình
RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Cài đặt các thư viện Node.js cần thiết
RUN npm install

# Mở port cho cả Nginx và ứng dụng Node.js
EXPOSE 80 3000

# Chạy cả Nginx và Node.js khi container khởi động
CMD ["sh", "-c", "service nginx start && node app.js"]
