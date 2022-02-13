$(function () {
    $(document).ready(function(){
        searchBank();
        searchProvince();
        searchCity(null);
    });

    $('#form-order').on('submit', function(event){
        event.preventDefault();
        Swal.fire({
            title: 'Yakin melanjutkan pesanan?',
            text: "Pastikan semua data telah di isi dengan benar!",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Batal',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, simpan pesanan'
        }).then((result) => {
            if (result.isConfirmed) {
                var form = $(this),
                    url = form.attr("action"),
                    method = "POST",
                    message = "Pesanan anda telah disimpan";

                $(".form-control").removeClass("is-invalid");
                $(".invalid-feedback").remove();
                
                $.ajax({
                    url: url,
                    method: method,
                    data: form.serialize(),
                    beforeSend: function () {
                        $(".btn").attr("disabled", true);
                    },
                    complete: function () {
                        $(".btn").removeAttr("disabled");
                    },
                    success: function (data) {
                        showSuccessToast(message);
                        console.log(data);
                    },
                    error: function (xhr) {
                        var res = xhr.responseJSON;
                        if ($.isEmptyObject(res) == false) {
                            $.each(res.errors, function (key, value) {
                                if(key === 'qty'){
                                    $('#qty').addClass('is-invalid');
                                    $('#input-qty').append(`<span class="invalid-feedback">${value}</span>`);
                                } else {
                                    $("#" + key)
                                        .addClass("is-invalid")
                                        .after(
                                            `<span class="invalid-feedback">${value}</span>`
                                        );
                                }
                            });
                        }
                    },
                });
            }
        })
    });

    $('body').on('click', '.btn-number', function(event){
        event.preventDefault();
        const fieldName = $(this).attr('data-field'),
                type = $(this).attr('data-type'),
                input = $('input[name="qty"]');

        var currentVal = parseInt(input.val());
        if(!isNaN(currentVal)){
            if(type == 'minus'){
                if(currentVal > input.attr('min')){
                    input.val(currentVal - 1).change();
                }
                if(parseInt(input.val()) == input.attr('min')){
                    $(this).attr('disabled', true);
                }
            } else if(type == 'plus'){
                if(currentVal < input.attr('max')){
                    input.val(currentVal + 1).change();
                }
                if(parseInt(input.val) == input.attr('max')){
                    $(this).attr('disabled', true);
                }
            } else {
                input.val(0);
            }
        }
    });

    $('.input-number').focusin(function(){
        $(this).data('oldValue', $(this).val());
    });

    $('.input-number').change(function() {
            
            minValue =  parseInt($(this).attr('min'));
            maxValue =  parseInt($(this).attr('max'));
            valueCurrent = parseInt($(this).val());
            
            name = $(this).attr('name');
            if(valueCurrent >= minValue) {
                $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
            } else {
                alert('Maaf, maximum qty telah dicapai');
                $(this).val($(this).data('oldValue'));
            }
            if(valueCurrent <= maxValue) {
                $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
            } else {
                alert('Maaf, minimum qty telah dicapai');
                $(this).val($(this).data('oldValue'));
            }
            
            
        });
        $(".input-number").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    $('.input-number').change(function(){
        var price = $('#price').val();
        var qty = $(this).val();

        var grand_total = parseInt(price) * parseInt(qty);
        $('#grand_total').text(rupiah(grand_total));
    });
});

searchProvince = () => {
    $("#province_id").select2({
        theme: "bootstrap4",
        ajax: {
            url: "/province-search",
            dataType: "json",
            data: function (params) {
                var query = {
                    search: params.term,
                };

                return query;
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.name,
                            id: item.id,
                        };
                    }),
                };
            },
        },
        placeholder: "Cari provinsi",
        cache: true,
    })
    .on('change', function(){
        const province_id = $(this).val();
        searchCity(province_id);
    });
}

searchBank = () => {
    $("#bank_id").select2({
        theme: "bootstrap4",
        ajax: {
            url: "/bank-search",
            dataType: "json",
            data: function (params) {
                var query = {
                    search: params.term,
                };

                return query;
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.name,
                            id: item.id,
                        };
                    }),
                };
            },
        },
        placeholder: "Cari bank",
        cache: true,
    });
}

searchCity = (province_id) => {
    $("#city_id").select2({
        theme: "bootstrap4",
        ajax: {
            url: "/city-search/" + province_id,
            dataType: "json",
            data: function (params) {
                var query = {
                    search: params.term,
                };

                return query;
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.name,
                            id: item.id,
                        };
                    }),
                };
            },
        },
        placeholder: "Cari kota",
        cache: true,
    });
}

showSuccessToast = (message) => {
    Swal.fire(
        'Berhasil!',
        message,
        'success'
    )
}

rupiah = (bilangan) => {
    var number_string = bilangan.toString(), sisa = number_string.length % 3, rupiah = number_string.substr(0, sisa), ribuan = number_string.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    // Cetak hasil
    return rupiah;
}