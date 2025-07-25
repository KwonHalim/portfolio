package portfolio.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorStatus {
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON500", "서버내부 오류입니다. 서버 담당자에게 문의하세요.")

    ;


    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
    }
