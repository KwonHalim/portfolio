package portfolio.backend.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
public class CustomPage<T> {

    private final List<T> content;      // 데이터 내용물
    private final int pageNumber;       // 현재 페이지 번호
    private final int pageSize;         // 페이지 크기
    private final int totalPages;       // 전체 페이지 수
    private final long totalElements;   // 전체 요소 수
    private final boolean isFirst;      // 첫 페이지 여부
    private final boolean isLast;       // 마지막 페이지 여부

    // Page 객체를 받아서 CustomPage DTO로 변환해주는 정적 팩토리 메서드
    public static <T> CustomPage<T> from(Page<T> page) {
        return CustomPage.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }
}