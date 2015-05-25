<?php

namespace spec\Pim\Component\Connector\ArrayConverter\Flat;

use PhpSpec\ObjectBehavior;
use Pim\Bundle\CatalogBundle\Model\AttributeInterface;
use Pim\Component\Connector\ArrayConverter\Flat\Product\Converter\ProductFieldConverter;
use Pim\Component\Connector\ArrayConverter\Flat\Product\Converter\ValueConverterInterface;
use Pim\Component\Connector\ArrayConverter\Flat\Product\Converter\ValueConverterRegistryInterface;
use Pim\Component\Connector\ArrayConverter\Flat\Product\Merger\ColumnsMerger;
use Pim\Component\Connector\ArrayConverter\Flat\Product\OptionsResolverConverter;
use Pim\Component\Connector\ArrayConverter\Flat\Product\Splitter\FieldSplitter;
use Pim\Component\Connector\ArrayConverter\Flat\ProductAssociationFieldResolver;
use Pim\Component\Connector\ArrayConverter\Flat\ProductAttributeFieldExtractor;
use Prophecy\Argument;

class ProductToStandardConverterSpec extends ObjectBehavior
{
    function let(
        ProductAttributeFieldExtractor $fieldExtractor,
        OptionsResolverConverter $optionsResolverConverter,
        ValueConverterRegistryInterface $converterRegistry,
        ProductAssociationFieldResolver $assocFieldResolver,
        FieldSplitter $fieldSplitter,
        ProductFieldConverter $productFieldConverter,
        ColumnsMerger $columnsMerger
    ) {
        $this->beConstructedWith(
            $fieldExtractor,
            $optionsResolverConverter,
            $converterRegistry,
            $assocFieldResolver,
            $fieldSplitter,
            $productFieldConverter,
            $columnsMerger
        );
    }

    function it_converts(
        $optionsResolverConverter,
        $fieldExtractor,
        $productFieldConverter,
        $converterRegistry,
        $columnsMerger,
        AttributeInterface $attribute1,
        AttributeInterface $attribute2,
        AttributeInterface $attribute3,
        AttributeInterface $attribute4,
        AttributeInterface $attribute5,
        ValueConverterInterface $converter
    ) {
        $item = [
            'sku'                    => '1069978',
            'categories'             => 'audio_video_sales,loudspeakers,sony',
            'enabled'                => '1',
            'name'                   => 'Sony SRS-BTV25',
            'release_date-ecommerce' => '2011-08-21',
        ];

        $optionsResolverConverter->resolveConverterOptions($item)->willReturn($item);
        $columnsMerger->merge($item)->willReturn($item);

        $productFieldConverter->supportsColumn('sku')->willReturn(false);
        $productFieldConverter->supportsColumn('categories')->willReturn(true);
        $productFieldConverter->supportsColumn('enabled')->willReturn(true);
        $productFieldConverter->supportsColumn('name')->willReturn(false);
        $productFieldConverter->supportsColumn('release_date-ecommerce')->willReturn(false);

        $productFieldConverter->convert('categories', 'audio_video_sales,loudspeakers,sony')->willReturn(
            ['categories' => ['audio_video_sales', 'loudspeakers', 'sony']]
        );
        $productFieldConverter->convert('enabled', '1')->willReturn(['enabled' => true]);

        $converterRegistry->getConverter(Argument::any())->willReturn($converter);

        $attribute1->getAttributeType()->willReturn('sku');
        $attribute2->getAttributeType()->willReturn('categories');
        $attribute3->getAttributeType()->willReturn('enabled');
        $attribute4->getAttributeType()->willReturn('name');
        $attribute5->getAttributeType()->willReturn('release_date-ecommerce');

        $fieldExtractor->extractAttributeFieldNameInfos('sku')->willReturn(['attribute' => $attribute1]);
        $fieldExtractor->extractAttributeFieldNameInfos('categories')->willReturn(['attribute' => $attribute2]);
        $fieldExtractor->extractAttributeFieldNameInfos('enabled')->willReturn(['attribute' => $attribute3]);
        $fieldExtractor->extractAttributeFieldNameInfos('name')->willReturn(['attribute' => $attribute4]);
        $fieldExtractor->extractAttributeFieldNameInfos('release_date-ecommerce')->willReturn(
            ['attribute' => $attribute5]
        );

        $converter->convert(['attribute' => $attribute1], '1069978')->willReturn(
            [
                'sku' => [
                    'locale' => '',
                    'scope'  => '',
                    'data'   => 1069978,
                ]
            ]
        );
        $converter->convert(['attribute' => $attribute2], 'audio_video_sales,loudspeakers,sony')->willReturn(
            ['categories' => ['audio_video_sales', 'loudspeakers', 'sony']]
        );
        $converter->convert(['attribute' => $attribute3], '1')->willReturn(['enabled' => true]);
        $converter->convert(['attribute' => $attribute4], 'Sony SRS-BTV25')->willReturn(
            [
                'name' => [
                    [
                        'locale' => '',
                        'scope'  => '',
                        'data'   => 'Sony SRS-BTV25',
                    ]
                ]
            ]
        );
        $converter->convert(['attribute' => $attribute5], '2011-08-21')->willReturn(
            [
                'release_date-ecommerce' => [
                    [
                        'locale' => '',
                        'scope'  => 'ecommerce',
                        'data'   => '2011-08-21'
                    ]
                ]
            ]
        );

        $result = [
            'sku'                    => [
                'locale' => '',
                'scope'  => '',
                'data'   => 1069978,
            ],
            'categories'             => ['audio_video_sales', 'loudspeakers', 'sony'],
            'enabled'                => true,
            'name'                   => [
                [
                    'locale' => '',
                    'scope'  => '',
                    'data'   => 'Sony SRS-BTV25',
                ]
            ],
            'release_date-ecommerce' => [
                [
                    'locale' => '',
                    'scope'  => 'ecommerce',
                    'data'   => '2011-08-21'
                ]
            ]
        ];

        $this->convert($item)->shouldReturn($result);
    }
}
