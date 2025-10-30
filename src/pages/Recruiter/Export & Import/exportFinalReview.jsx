import * as XLSX from 'xlsx'

export function exportFinalReviewExcel(filteredCandidates) {
    const title = 'MẪU ĐỀ NGHỊ CUNG CẤP DỊCH VỤ HẬU KIỂM'

    const headerTop = ['STT', 'Họ và tên', 'Ngày sinh', 'Số CMND/HC', 'Ngày thi', 'Số điểm TOEIC hiện tại', '', '']
    const headerBottom = ['', '', '', '', '', 'Nghe', 'Đọc', 'Tổng']

    const aoa = [
        [title],
        [],
        ['Tên đơn vị:', '', '', '', '', 'Chức vụ:'],
        ['Địa chỉ:', '', '', '', '', 'Fax:'],
        ['Đại diện: Ông/ Bà', '', '', '', '', 'Điện thoại:'],
        ['Mục đích sử dụng TOEIC:'],
        ['Đề nghị cung cấp dịch vụ hậu kiểm đối với kết quả thi TOEIC của những cá nhân có tên và thông tin liên quan như sau:'],
        [],
        headerTop,
        headerBottom
    ]

    filteredCandidates.forEach((c, idx) => {
        aoa.push([
            idx + 1,
            c.name || '',
            '',
            '',
            '',
            '',
            '',
            c.score ?? ''
        ])
    })

    const ws = XLSX.utils.aoa_to_sheet(aoa)

    ws['!cols'] = [
        { wch: 6 },
        { wch: 28 },
        { wch: 14 },
        { wch: 18 },
        { wch: 14 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 }
    ]

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
        { s: { r: 2, c: 5 }, e: { r: 2, c: 7 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } },
        { s: { r: 3, c: 5 }, e: { r: 3, c: 7 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } },
        { s: { r: 4, c: 5 }, e: { r: 4, c: 7 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 7 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 7 } },
        { s: { r: 8, c: 0 }, e: { r: 9, c: 0 } },
        { s: { r: 8, c: 1 }, e: { r: 9, c: 1 } },
        { s: { r: 8, c: 2 }, e: { r: 9, c: 2 } },
        { s: { r: 8, c: 3 }, e: { r: 9, c: 3 } },
        { s: { r: 8, c: 4 }, e: { r: 9, c: 4 } },
        { s: { r: 8, c: 5 }, e: { r: 8, c: 7 } }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'HauKiem')
    XLSX.writeFile(wb, `hau_kiem_${new Date().toISOString().slice(0, 10)}.xlsx`)
}