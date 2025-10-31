// Dữ liệu doanh thu
const revenueData = {
  "Quy Nhơn": {
    "Tháng 8": 336223500,
    "Tháng 9": 290326986,
    "Tháng 10": 195631972,
  },
  "Quảng Ngãi": {
    "Tháng 8": 257725000,
    "Tháng 9": 228070000,
    "Tháng 10": 188408000,
  },
  "Kon Tum": {
    "Tháng 7": 105418000,
    "Tháng 8": 144504000,
    "Tháng 9": 110343000,
    "Tháng 10": 82177000,
  },
};

// Format số tiền - Tương thích với mobile browsers
function formatCurrency(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "0 VNĐ";
  }

  try {
    // Sử dụng Intl.NumberFormat nếu hỗ trợ (iOS Safari 10+)
    if (typeof Intl !== "undefined" && Intl.NumberFormat) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      // Fallback cho browser cũ
      return amount.toLocaleString("vi-VN") + " VNĐ";
    }
  } catch (error) {
    // Fallback nếu có lỗi
    return amount.toLocaleString("vi-VN") + " VNĐ";
  }
}

// Tính toán lợi nhuận tự động
function calculateProfit() {
  try {
    const profitElements = document.querySelectorAll(".profit");

    if (!profitElements || profitElements.length === 0) {
      console.warn("Không tìm thấy phần tử .profit");
      return;
    }

    profitElements.forEach((element) => {
      try {
        const row = element.closest("tr");
        if (!row) {
          console.warn("Không tìm thấy row element");
          return;
        }

        // Lấy doanh thu từ data attribute hoặc từ ô revenue
        const revenueCell = row.querySelector(".revenue");
        const revenueText = revenueCell ? revenueCell.textContent || "" : "";
        const revenue =
          parseInt(revenueText.replace(/[^\d]/g, "")) ||
          parseInt(element.dataset.revenue) ||
          0;

        // Lấy mặt bằng từ cột thứ 3 (index 2)
        const rentCells = row.querySelectorAll("td");
        const rentCell = rentCells[2];
        const rentText = rentCell ? rentCell.textContent || "" : "";
        let rent = 0;
        if (rentText.indexOf("phòng") !== -1) {
          // Nếu là "4 phòng", giả sử giá trị mặc định hoặc tính theo số phòng
          const roomMatch = rentText.match(/\d+/);
          const roomCount = roomMatch ? parseInt(roomMatch[0]) : 0;
          rent = roomCount * 5000000; // Giả sử mỗi phòng 5 triệu
        } else {
          rent = parseInt(rentText.replace(/[^\d]/g, "")) || 0;
        }

        // Lấy nhân viên từ cột staff-cost
        const staffCell = row.querySelector(".staff-cost");
        const staffText = staffCell ? staffCell.textContent || "" : "";
        const staff = parseInt(staffText.replace(/[^\d]/g, "")) || 0;

        // Tính tổng chi phí = mặt bằng + nhân viên
        const totalCosts = rent + staff;

        // Tính lợi nhuận = doanh thu - chi phí
        const profit = revenue - totalCosts;

        // Cập nhật giá trị lợi nhuận
        if (element && typeof formatCurrency === "function") {
          element.textContent = formatCurrency(profit);
        } else {
          // Fallback nếu formatCurrency chưa có
          element.textContent = profit.toLocaleString("vi-VN") + " VNĐ";
        }

        // Cập nhật data attributes để tính tổng sau này
        if (element.dataset) {
          element.dataset.revenue = revenue.toString();
          element.dataset.costs = totalCosts.toString();
        }

        // Thêm class màu sắc dựa trên lợi nhuận
        element.classList.remove("profit-high", "profit-medium", "profit-low");
        if (profit >= 200000000) {
          element.classList.add("profit-high");
        } else if (profit >= 100000000) {
          element.classList.add("profit-medium");
        } else {
          element.classList.add("profit-low");
        }
      } catch (error) {
        console.error("Lỗi khi tính lợi nhuận cho một phần tử:", error);
      }
    });
  } catch (error) {
    console.error("Lỗi trong hàm calculateProfit:", error);
  }
}

// Cập nhật tổng lợi nhuận
function updateTotalProfit() {
  const profitElements = document.querySelectorAll(".profit");
  let totalProfit = 0;

  profitElements.forEach((element) => {
    const revenue = parseInt(element.dataset.revenue);
    const costs = parseInt(element.dataset.costs);
    totalProfit += revenue - costs;
  });

  // Thêm tổng lợi nhuận vào summary cards nếu cần
  const summaryCards = document.querySelector(".summary-cards");
  if (summaryCards && !document.getElementById("totalProfit")) {
    const profitCard = document.createElement("div");
    profitCard.className = "summary-card";
    profitCard.innerHTML = `
      <h3>Tổng Lợi Nhuận</h3>
      <div class="amount" id="totalProfit">${formatCurrency(totalProfit)}</div>
    `;
    summaryCards.appendChild(profitCard);
  } else if (document.getElementById("totalProfit")) {
    document.getElementById("totalProfit").textContent =
      formatCurrency(totalProfit);
  }
}

// Tính tổng doanh thu
function calculateTotalRevenue() {
  let total = 0;
  Object.values(revenueData).forEach((branch) => {
    Object.values(branch).forEach((amount) => {
      total += amount;
    });
  });
  return total;
}

// Tìm chi nhánh tốt nhất
function findBestBranch() {
  let bestBranch = "";
  let maxRevenue = 0;

  Object.entries(revenueData).forEach(([branch, months]) => {
    const branchTotal = Object.values(months).reduce(
      (sum, amount) => sum + amount,
      0
    );
    if (branchTotal > maxRevenue) {
      maxRevenue = branchTotal;
      bestBranch = branch;
    }
  });

  return bestBranch;
}

// Tìm tháng tốt nhất
function findBestMonth() {
  const monthTotals = {};

  Object.values(revenueData).forEach((branch) => {
    Object.entries(branch).forEach(([month, amount]) => {
      monthTotals[month] = (monthTotals[month] || 0) + amount;
    });
  });

  let bestMonth = "";
  let maxAmount = 0;

  Object.entries(monthTotals).forEach(([month, amount]) => {
    if (amount > maxAmount) {
      maxAmount = amount;
      bestMonth = month;
    }
  });

  return bestMonth;
}

// Cập nhật thông tin tổng quan
function updateSummary() {
  document.getElementById("totalRevenue").textContent = formatCurrency(
    calculateTotalRevenue()
  );
  document.getElementById("bestBranch").textContent = findBestBranch();
  document.getElementById("bestMonth").textContent = findBestMonth();
  document.getElementById("lastUpdate").textContent = new Date().toLocaleString(
    "vi-VN"
  );
}

// Tạo biểu đồ
function createChart() {
  const canvas = document.getElementById("revenueChart");
  if (!canvas) {
    console.error("Không tìm thấy canvas element!");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Không thể lấy context từ canvas!");
    return;
  }

  // Xóa biểu đồ cũ nếu có
  if (window.revenueChartInstance) {
    window.revenueChartInstance.destroy();
  }

  // Lấy tất cả tháng có dữ liệu
  const allMonths = new Set();
  Object.values(revenueData).forEach((branch) => {
    Object.keys(branch).forEach((month) => allMonths.add(month));
  });
  const months = Array.from(allMonths).sort((a, b) => {
    const monthOrder = {
      "Tháng 7": 7,
      "Tháng 8": 8,
      "Tháng 9": 9,
      "Tháng 10": 10,
    };
    return monthOrder[a] - monthOrder[b];
  });

  const branches = Object.keys(revenueData);

  const datasets = branches.map((branch, index) => {
    const colors = [
      {
        border: "#667eea",
        background: "rgba(102, 126, 234, 0.1)",
        point: "#667eea",
      },
      {
        border: "#f093fb",
        background: "rgba(240, 147, 251, 0.1)",
        point: "#f093fb",
      },
      {
        border: "#4facfe",
        background: "rgba(79, 172, 254, 0.1)",
        point: "#4facfe",
      },
    ];
    return {
      label: branch,
      data: months.map((month) => revenueData[branch][month] || 0),
      backgroundColor: colors[index].background,
      borderColor: colors[index].border,
      pointBackgroundColor: colors[index].point,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 3,
      borderWidth: 4,
      fill: true,
      tension: 0.6,
      pointRadius: 8,
      pointHoverRadius: 12,
      pointHoverBackgroundColor: colors[index].point,
      pointHoverBorderColor: "#ffffff",
      pointHoverBorderWidth: 4,
    };
  });

  // Tạo biểu đồ và lưu instance
  window.revenueChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2.5,
      plugins: {
        title: {
          display: true,
          text: "📊 Doanh Thu Theo Tháng",
          font: {
            size: 22,
            weight: "bold",
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          },
          color: "#2c3e50",
          padding: {
            top: 20,
            bottom: 30,
          },
        },
        legend: {
          display: true,
          position: "top",
          align: "center",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 25,
            font: {
              size: 16,
              weight: "bold",
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            color: "#2c3e50",
            boxWidth: 20,
            boxHeight: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(44, 62, 80, 0.95)",
          titleColor: "#ecf0f1",
          bodyColor: "#ecf0f1",
          borderColor: "#3498db",
          borderWidth: 2,
          cornerRadius: 12,
          displayColors: true,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
            weight: "500",
          },
          padding: 12,
          callbacks: {
            title: function (context) {
              return "📅 " + context[0].label;
            },
            label: function (context) {
              return (
                "🏢 " +
                context.dataset.label +
                ": " +
                formatCurrency(context.parsed.y)
              );
            },
            afterLabel: function (context) {
              const value = context.parsed.y;
              if (value >= 200000000) {
                return "💰 Doanh thu cao";
              } else if (value >= 100000000) {
                return "📈 Doanh thu tốt";
              } else {
                return "📊 Doanh thu ổn định";
              }
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(52, 152, 219, 0.1)",
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 14,
              weight: "bold",
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            color: "#2c3e50",
            padding: 15,
          },
          border: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(52, 152, 219, 0.1)",
            drawBorder: false,
          },
          ticks: {
            font: {
              size: 12,
              weight: "500",
              family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            },
            color: "#2c3e50",
            padding: 15,
            callback: function (value) {
              if (value >= 1000000000) {
                return (value / 1000000000).toFixed(1) + "B VNĐ";
              } else if (value >= 1000000) {
                return (value / 1000000).toFixed(0) + "M VNĐ";
              } else if (value >= 1000) {
                return (value / 1000).toFixed(0) + "K VNĐ";
              }
              return value + " VNĐ";
            },
          },
          border: {
            display: false,
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 12,
        },
        line: {
          borderCapStyle: "round",
          borderJoinStyle: "round",
        },
      },
      animation: {
        duration: 2000,
        easing: "easeInOutQuart",
        delay: (context) => {
          let delay = 0;
          if (context.type === "data" && context.mode === "default") {
            delay = context.dataIndex * 200 + context.datasetIndex * 100;
          }
          return delay;
        },
      },
      hover: {
        animationDuration: 300,
      },
    },
  });
}

// Thêm hiệu ứng số đếm
function animateNumbers() {
  const elements = document.querySelectorAll(".revenue");
  elements.forEach((element) => {
    const finalValue = element.textContent;
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ""));

    if (numericValue) {
      let currentValue = 0;
      const increment = numericValue / 50;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
          currentValue = numericValue;
          clearInterval(timer);
        }
        element.textContent = formatCurrency(Math.floor(currentValue));
      }, 30);
    }
  });
}

// Xử lý popup modal cho hình ảnh hóa đơn - Tương thích mobile
function handleInvoiceModal() {
  try {
    const modal = document.getElementById("invoiceModal");
    const modalImage = document.getElementById("modalImage");
    const modalCaption = document.getElementById("modalCaption");
    const closeBtn = document.querySelector(".close");
    const thumbnails = document.querySelectorAll(".invoice-thumbnail");

    if (!modal || !modalImage || !modalCaption) {
      console.warn("Không tìm thấy các element của modal");
      return;
    }

    // Hàm mở modal
    function openModal(imageSrc, caption) {
      try {
        modalImage.src = imageSrc;
        modalCaption.textContent = caption || "Hóa đơn";
        modal.style.display = "block";

        // Ngăn scroll - tương thích với iOS Safari
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";

        // Prevent touch move trên iOS
        document.addEventListener("touchmove", preventScroll, {
          passive: false,
        });
      } catch (error) {
        console.error("Lỗi khi mở modal:", error);
      }
    }

    // Hàm đóng modal
    function closeModal() {
      try {
        modal.style.display = "none";

        // Khôi phục scroll
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";

        // Remove touch move listener
        document.removeEventListener("touchmove", preventScroll);
      } catch (error) {
        console.error("Lỗi khi đóng modal:", error);
      }
    }

    // Prevent scroll khi modal mở (iOS Safari)
    function preventScroll(e) {
      if (modal.style.display === "block") {
        e.preventDefault();
      }
    }

    // Mở modal khi click vào thumbnail (hỗ trợ cả touch và click)
    if (thumbnails && thumbnails.length > 0) {
      thumbnails.forEach((thumbnail) => {
        // Sử dụng cả click và touchstart để tương thích mobile
        thumbnail.addEventListener("click", function (e) {
          e.preventDefault();
          const imageSrc = this.dataset.fullImage || this.src;
          openModal(imageSrc, this.alt);
        });

        // Touch event cho mobile
        thumbnail.addEventListener("touchend", function (e) {
          e.preventDefault();
          const imageSrc = this.dataset.fullImage || this.src;
          openModal(imageSrc, this.alt);
        });
      });
    }

    // Đóng modal khi click vào nút X
    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
      closeBtn.addEventListener("touchend", function (e) {
        e.preventDefault();
        closeModal();
      });
    }

    // Đóng modal khi click bên ngoài
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Đóng modal bằng phím ESC (desktop)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.style.display === "block") {
        closeModal();
      }
    });

    console.log("✓ Modal handlers đã được gắn thành công");
  } catch (error) {
    console.error("✗ Lỗi khi khởi tạo modal handlers:", error);
  }
}

// Khởi tạo khi trang load - Hỗ trợ cả DOMContentLoaded và window.onload
function initializeApp() {
  // Kiểm tra xem DOM đã sẵn sàng chưa
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
    return;
  }

  // Tính toán lợi nhuận trước
  try {
    calculateProfit();
    updateTotalProfit();
    updateSummary();
    console.log("✓ Tính toán lợi nhuận và tổng quan đã hoàn thành");
  } catch (error) {
    console.error("✗ Lỗi khi tính toán:", error);
  }

  // Khởi tạo modal popup
  try {
    handleInvoiceModal();
    console.log("✓ Modal popup đã được khởi tạo");
  } catch (error) {
    console.error("✗ Lỗi khi khởi tạo modal:", error);
  }

  // Đợi Chart.js load xong và tạo biểu đồ
  let chartAttempts = 0;
  const maxChartAttempts = 50; // Tối đa 5 giây

  function initChart() {
    chartAttempts++;

    if (typeof Chart === "undefined") {
      if (chartAttempts < maxChartAttempts) {
        setTimeout(initChart, 100);
        return;
      } else {
        console.error("✗ Chart.js không thể load sau nhiều lần thử");
        return;
      }
    }

    try {
      const canvas = document.getElementById("revenueChart");
      if (canvas) {
        createChart();
        console.log("✓ Biểu đồ đã được tạo thành công!");
      } else {
        console.error("✗ Không tìm thấy canvas element với id 'revenueChart'");
      }
    } catch (error) {
      console.error("✗ Lỗi khi tạo biểu đồ:", error);
    }
  }

  // Bắt đầu khởi tạo biểu đồ
  initChart();

  // Delay animation để trang load xong
  setTimeout(() => {
    try {
      animateNumbers();
      console.log("✓ Animation đã được khởi chạy");
    } catch (error) {
      console.error("✗ Lỗi khi animate numbers:", error);
    }
  }, 500);

  console.log("✓ Ứng dụng đã được khởi tạo");
}

// Khởi chạy ứng dụng
if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  // DOM đã sẵn sàng, chạy ngay
  setTimeout(initializeApp, 1);
} else {
  // Chờ DOM load
  document.addEventListener("DOMContentLoaded", initializeApp);
}

// Fallback: Nếu DOMContentLoaded không fire (một số browser cũ)
window.addEventListener("load", function () {
  // Kiểm tra xem đã khởi tạo chưa
  if (!window.appInitialized) {
    window.appInitialized = true;
    initializeApp();
  }
});

// Thêm hiệu ứng hover cho các card
document
  .querySelectorAll(".revenue-table-container, .summary-card")
  .forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });
